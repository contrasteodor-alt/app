"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type EventType = "downtime" | "changeover" | "scrap" | "quality" | "note";

type NewEvent = {
  type: EventType;
  lineId: string;
  timestamp: string; // ISO string
  durationMin?: number;
  qty?: number;
  category: string;
  comment?: string;
  operator?: string;
  station?: string;
  tags?: string[];
};

type StoredEvent = NewEvent & {
  id: string;
  createdAt: string;
};

type ShiftHeader = {
  id: string;
  org_id?: string;
  shift_name: string;
  started_at: string;
  planned_time_min: number;
  ideal_cycle_sec: number;
  output_units: number;
  scrap_units: number;
  created_at?: string;
};

const LINE_OPTIONS = [
  { id: "line-1", name: "Line 1 – Press" },
  { id: "line-2", name: "Line 2 – Assembly" },
  { id: "line-3", name: "Line 3 – Pack" },
];

const CATEGORY_BY_TYPE: Record<EventType, string[]> = {
  downtime: ["sensor_fault", "jam", "maintenance", "no_material", "no_operator", "other"],
  changeover: ["tooling", "program", "material", "setup", "first_off_approval", "other"],
  scrap: ["warped_material", "dimension_oos", "surface_defect", "wrong_part", "other"],
  quality: ["audit_fail", "rework", "containment", "customer_return", "other"],
  note: ["shift_note", "handover", "safety", "5s", "other"],
};

function nowLocalISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function nowISO() {
  return new Date().toISOString();
}

function isPositiveInt(n: any) {
  return Number.isInteger(n) && n > 0;
}

export default function IngestClient() {

  
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingShift, setLoadingShift] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState("");

  const [events, setEvents] = useState<StoredEvent[]>([]);

  // Shift header from DB
  
  const [shift, setShift] = useState<ShiftHeader | null>(null);
  const [shiftForm, setShiftForm] = useState(() => ({
    shiftName: "A",
    startedAt: nowISO(),
    plannedTimeMin: 450,
    idealCycleSec: 12,
    outputUnits: 1200,
    scrapUnits: 18,
  }));
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  // Event form
  const [form, setForm] = useState<NewEvent>(() => ({
    type: "downtime",
    lineId: "line-1",
    timestamp: nowLocalISO(),
    durationMin: 10,
    qty: undefined,
    category: CATEGORY_BY_TYPE.downtime[0],
    comment: "",
    operator: "",
    station: "",
    tags: [],
  }));

  const categories = useMemo(() => CATEGORY_BY_TYPE[form.type], [form.type]);

  // When event type changes: adjust category + relevant fields
  useEffect(() => {
    setForm((prev) => {
      const t = prev.type;
      const needsDuration = t === "downtime" || t === "changeover";
      const needsQty = t === "scrap" || t === "quality";

      return {
        ...prev,
        category: CATEGORY_BY_TYPE[t][0] ?? "other",
        durationMin: needsDuration ? prev.durationMin ?? 10 : undefined,
        qty: needsQty ? prev.qty ?? 1 : undefined,
      };
    });
  }, [form.type]);

  async function loadShift() {
    setLoadingShift(true);
    setErr("");
    try {
      const r = await fetch("/api/ingest/shift", { method: "GET" });
      const ct = r.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await r.json() : { error: await r.text() };

      if (!r.ok) {
        // If unauthorized, middleware should have redirected already. Still handle.
        setErr(data?.error || "Failed to load shift header");
        return;
      }

      setShift(data?.shift ?? null);

      // If we loaded a shift, optionally seed form fields (non-destructive)
      const s: ShiftHeader | null = data?.shift ?? null;
      if (s) {
        setShiftForm((p) => ({
          ...p,
          shiftName: s.shift_name ?? p.shiftName,
          startedAt: s.started_at ?? p.startedAt,
          plannedTimeMin: Number(s.planned_time_min ?? p.plannedTimeMin),
          idealCycleSec: Number(s.ideal_cycle_sec ?? p.idealCycleSec),
          outputUnits: Number(s.output_units ?? p.outputUnits),
          scrapUnits: Number(s.scrap_units ?? p.scrapUnits),
        }));
      }
    } catch (e: any) {
      setErr(e?.message || "Network error while loading shift header");
    } finally {
      setLoadingShift(false);
    }
  }

  const params = useParams();
const orgId = params.id as string;

async function saveShift() {
  try {
    setLoadingShift(true);
    setErr(null);

    const res = await fetch("/api/ingest/shift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
   
   body: JSON.stringify({
       orgId,
       ...shiftForm, // shiftName, startedAt, lineId, etc
     }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();

    // ✅ THIS is where it belongs
    setActiveShiftId(data.shift.id);
    setShift(data.shift);
    setOkMsg("Shift saved and active.");

  } catch (e: any) {
    setErr(e.message || "Failed to save shift");
  } finally {
    setLoadingShift(false);
  }
}


  async function refreshEvents(shiftId?: string) {
    setLoadingEvents(true);
    setErr("");

    try {
      const url = shiftId
        ? `/api/ingest/events?shiftId=${encodeURIComponent(shiftId)}`
        : shift?.id
        ? `/api/ingest/events?shiftId=${encodeURIComponent(shift.id)}`
        : "/api/ingest/events";

      const r = await fetch(url, { method: "GET" });
      const ct = r.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await r.json() : { error: await r.text() };

      if (!r.ok) {
        setErr(data?.error || "Failed to load events");
        return;
      }

      setEvents(data?.events || []);
    } catch (e: any) {
      setErr(e?.message || "Network error while loading events");
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    // Boot sequence: load shift header (if any), then load events (for that shift if present).
    (async () => {
      await loadShift();
      await refreshEvents();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validateEvent(e: NewEvent): string | null {
    if (!e.lineId) return "Line is required.";
    if (!e.timestamp) return "Timestamp is required.";
    if (!e.category) return "Category is required.";

    const needsDuration = e.type === "downtime" || e.type === "changeover";
    const needsQty = e.type === "scrap" || e.type === "quality";

    if (needsDuration) {
      if (!isPositiveInt(e.durationMin)) return "Duration (min) must be a positive integer for downtime/changeover.";
      if ((e.durationMin ?? 0) > 480) return "Duration looks unrealistic (> 480 min). Check input.";
    } else if (e.durationMin != null) {
      return "Duration should be empty for this event type.";
    }

    if (needsQty) {
      if (!isPositiveInt(e.qty)) return "Qty must be a positive integer for scrap/quality.";
      if ((e.qty ?? 0) > 100000) return "Qty looks unrealistic. Check input.";
    } else if (e.qty != null) {
      return "Qty should be empty for this event type.";
    }

    return null;
  }

  async function submitEvent() {
    setLoading(true);
    setErr("");
    setOkMsg("");

    if (!shift?.id) {
      setErr("Save Shift Header first (shiftId required).");
      setLoading(false);
      return;
    }

    const v = validateEvent(form);
    if (v) {
      setErr(v);
      setLoading(false);
      return;
    }

    try {
      const r = await fetch("/api/ingest/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, shiftId: shift.id }),
      });

      const ct = r.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await r.json() : { error: await r.text() };

      if (!r.ok) {
        setErr(data?.error || "Ingest failed");
        return;
      }

      setOkMsg(`Recorded event ${data?.event?.id || ""}`.trim());
      setForm((prev) => ({ ...prev, timestamp: nowLocalISO() }));
      await refreshEvents(shift.id);
    } catch (e: any) {
      setErr(e?.message || "Network/server error");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Ingest production events</h1>
          <p className="text-muted-foreground">
            Structured intake → traceable metrics → AI actions tied to evidence. (Supabase-backed)
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/">Back to cockpit</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/ai">AI review</Link>
          </Button>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* LEFT: Shift + Event form */}
        <div className="space-y-4 lg:col-span-1">

{activeShiftId && (
  <div className="rounded-lg border bg-muted/40 px-4 py-3">
    <div className="text-sm text-muted-foreground">
      Active shift
    </div>
    <div className="text-base font-medium">
      {shift?.shift_name} • Line {form.lineId} •{" "}
{shift?.started_at
  ? new Date(shift.started_at).toLocaleDateString()
  : "—"}


    </div>
  </div>
)}

          {/* Shift Header */}
          <Card>
            <CardHeader>
              <CardTitle>Shift header</CardTitle>
              <CardDescription>Hard inputs used for OEE + AI context. Save this before logging events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Shift</label>
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={shiftForm.shiftName}
                    onChange={(e) => setShiftForm((p) => ({ ...p, shiftName: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Started at (ISO)</label>
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={shiftForm.startedAt}
                    onChange={(e) => setShiftForm((p) => ({ ...p, startedAt: e.target.value }))}
                    placeholder="2025-12-17T08:00:00.000Z"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Planned time (min)</label>
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    type="number"
                    value={shiftForm.plannedTimeMin}
                    onChange={(e) => setShiftForm((p) => ({ ...p, plannedTimeMin: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Ideal cycle (sec)</label>
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    type="number"
                    value={shiftForm.idealCycleSec}
                    onChange={(e) => setShiftForm((p) => ({ ...p, idealCycleSec: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Output units</label>
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    type="number"
                    value={shiftForm.outputUnits}
                    onChange={(e) => setShiftForm((p) => ({ ...p, outputUnits: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Scrap units</label>
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    type="number"
                    value={shiftForm.scrapUnits}
                    onChange={(e) => setShiftForm((p) => ({ ...p, scrapUnits: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={saveShift} disabled={loadingShift}>
                  {loadingShift ? "Saving..." : "Save shift header"}
                </Button>

                <Button variant="outline" onClick={loadShift} disabled={loadingShift}>
                  {loadingShift ? "Refreshing..." : "Load latest"}
                </Button>

                {shift?.id ? (
                  <span className="text-xs text-muted-foreground">
                    Active shiftId: <span className="font-mono">{shift.id}</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No shift saved yet.</span>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Engineering rule: events must attach to a shift. No orphan data.
              </div>
            </CardContent>
          </Card>

          {/* New Event */}
          <Card>
            <CardHeader>
              <CardTitle>New event</CardTitle>
              <CardDescription>Structured event input. Keep it factual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as EventType }))}
                >
                  <option value="downtime">Downtime</option>
                  <option value="changeover">Changeover</option>
                  <option value="scrap">Scrap</option>
                  <option value="quality">Quality</option>
                  <option value="note">Note</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Line</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.lineId}
                  onChange={(e) => setForm((p) => ({ ...p, lineId: e.target.value }))}
                >
                  {LINE_OPTIONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Timestamp</label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.timestamp}
                  onChange={(e) => setForm((p) => ({ ...p, timestamp: e.target.value }))}
                  placeholder="YYYY-MM-DDTHH:MM"
                />
                <div className="text-xs text-muted-foreground">Use local time string for UI; stored as timestamptz.</div>
              </div>

              {(form.type === "downtime" || form.type === "changeover") && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Duration (min)</label>
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    type="number"
                    value={form.durationMin ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, durationMin: Number(e.target.value) }))}
                  />
                </div>
              )}

              {(form.type === "scrap" || form.type === "quality") && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Qty</label>
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    type="number"
                    value={form.qty ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, qty: Number(e.target.value) }))}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Separator />

              <div className="space-y-1">
                <label className="text-sm font-medium">Station (optional)</label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.station ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, station: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Operator (optional)</label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.operator ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, operator: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Comment</label>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  rows={3}
                  value={form.comment ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Short, factual note. No opinions."
                />
              </div>

              {err ? <p className="text-sm text-red-600 whitespace-pre-wrap">{err}</p> : null}
              {okMsg ? <p className="text-sm text-green-600 whitespace-pre-wrap">{okMsg}</p> : null}

              <Button onClick={submitEvent} disabled={loading} className="w-full">
                {loading ? "Recording..." : "Record event"}
              </Button>

              <div className="text-xs text-muted-foreground">
                This writes to Supabase and enforces linkage to the active shift header.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Recent ingested */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recently ingested</CardTitle>
            <CardDescription>Audit trail view: what entered the system (filtered by active shift).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => refreshEvents(shift?.id)}
                disabled={loadingEvents}
              >
                {loadingEvents ? "Refreshing..." : "Refresh"}
              </Button>

              {shift?.id ? (
                <span className="text-xs text-muted-foreground">
                  Showing events for shiftId: <span className="font-mono">{shift.id}</span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  No shift selected yet — save/load shift header first.
                </span>
              )}
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr className="border-b">
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Line</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Dur</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-4">Comment</th>
                    <th className="py-2">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="py-2 pr-4">{e.timestamp}</td>
                      <td className="py-2 pr-4">{e.lineId}</td>
                      <td className="py-2 pr-4">{e.type}</td>
                      <td className="py-2 pr-4">{e.category}</td>
                      <td className="py-2 pr-4">{e.durationMin != null ? `${e.durationMin}` : "—"}</td>
                      <td className="py-2 pr-4">{e.qty != null ? `${e.qty}` : "—"}</td>
                      <td className="py-2 pr-4">{e.comment || "—"}</td>
                      <td className="py-2 font-mono text-xs">{e.id}</td>
                    </tr>
                  ))}

                  {events.length === 0 ? (
                    <tr>
                      <td className="py-6 text-sm text-muted-foreground" colSpan={8}>
                        No ingested events yet for this shift.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link href="/ai">Analyze this shift (AI)</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to cockpit</Link>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Investor-grade point: this is the data contract. Frontend reads only via API; backend storage is Supabase.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
