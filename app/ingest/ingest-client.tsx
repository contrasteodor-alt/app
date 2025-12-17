type ShiftHeader = {
  id: string;
  started_at: string;
  planned_time_min: number;
  ideal_cycle_sec: number;
  output_units: number;
  scrap_units: number;
  shift_name: string;
};

const [shift, setShift] = useState<ShiftHeader | null>(null);
const [shiftForm, setShiftForm] = useState(() => ({
  shiftName: "A",
  startedAt: new Date().toISOString(),
  plannedTimeMin: 450,
  idealCycleSec: 12,
  outputUnits: 1200,
  scrapUnits: 18,
}));


"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type EventType = "downtime" | "changeover" | "scrap" | "quality" | "note";

type NewEvent = {
  type: EventType;
  lineId: string;
  timestamp: string; // ISO
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
  // Keep it ISO but without milliseconds for readability
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function isPositiveInt(n: any) {
  return Number.isInteger(n) && n > 0;
}

export default function IngestClient() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [events, setEvents] = useState<StoredEvent[]>([]);

  const [form, setForm] = useState<NewEvent>(() => ({
    type: "downtime",
    lineId: "line-1",
    timestamp: nowLocalISO(),
    durationMin: 10,
    qty: undefined,
    category: "sensor_fault",
    comment: "",
    operator: "",
    station: "",
    tags: [],
  }));

  const categories = useMemo(() => CATEGORY_BY_TYPE[form.type], [form.type]);

  useEffect(() => {
    // Adjust category defaults when type changes
    setForm((prev) => ({
      ...prev,
      category: CATEGORY_BY_TYPE[prev.type][0] ?? "other",
      durationMin: prev.type === "downtime" || prev.type === "changeover" ? prev.durationMin ?? 10 : undefined,
      qty: prev.type === "scrap" || prev.type === "quality" ? prev.qty ?? 1 : undefined,
    }));
  }, [form.type]);

  async function refreshEvents(shiftId?: string) {
    setErr("");
    try {
     const url = shiftId ? `/api/ingest/events?shiftId=${encodeURIComponent(shiftId)}` : "/api/ingest/events";
const r = await fetch(url, { method: "GET" });

      const data = await r.json();
      if (!r.ok) {
        setErr(data?.error || "Failed to load events");
        return;
      }
      setEvents(data?.events || []);
    } catch (e: any) {
      setErr(e?.message || "Network error");
    }
  }

 useEffect(() => {
  loadShift().then(() => refreshEvents());
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  function validate(e: NewEvent): string | null {
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

async function loadShift() {
  try {
    const r = await fetch("/api/ingest/shift");
    const data = await r.json();
    if (r.ok) setShift(data.shift);
  } catch {}
}

async function saveShift() {
  setErr("");
  setOkMsg("");

  try {
    const r = await fetch("/api/ingest/shift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shiftForm),
    });

    const data = await r.json();
    if (!r.ok) {
      setErr(data?.error || "Failed to save shift header");
      return;
    }

    setShift(data.shift);
    setOkMsg(`Saved shift ${data.shift.id}`);
    await refreshEvents(data.shift.id);
  } catch (e: any) {
    setErr(e?.message || "Network error");
  }
}


  async function submit() {
if (!shift?.id) {
  setErr("Save Shift Header first (shiftId required).");
  setLoading(false);
  return;
}

    setLoading(true);
    setErr("");
    setOkMsg("");

    const v = validate(form);
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

      const contentType = r.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await r.json() : { error: await r.text() };

      if (!r.ok) {
        setErr(data?.error || "Ingest failed");
        return;
      }

      setOkMsg(`Recorded event ${data?.event?.id || ""}`.trim());
      setForm((prev) => ({ ...prev, timestamp: nowLocalISO() }));
      await refreshEvents();
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
   <div className="grid gap-6 lg:grid-cols-2">
  {/* LEFT COLUMN */}
  <div className="space-y-6">

    {/* ✅ SHIFT HEADER CARD — ADD HERE */}
    <Card>
      <CardHeader>
        <CardTitle>Shift header</CardTitle>
        <CardDescription>
          Hard inputs used for OEE, AI reasoning and traceability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* shift inputs + save button */}
      </CardContent>
    </Card>

    {/* EXISTING: NEW EVENT CARD */}
    <Card>
      <CardHeader>
        <CardTitle>New event</CardTitle>
      </CardHeader>
      <CardContent>
        {/* existing event form */}
      </CardContent>
    </Card>

  </div>

  {/* RIGHT COLUMN */}
  <div className="space-y-6">
    {/* events table / timeline */}
  </div>
</div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Ingest production events</h1>
        <p className="text-muted-foreground">
          Engineering-grade intake: structured, validated, auditable. (Demo store via API)
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/">Back to cockpit</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/ai">Run engineering review (AI)</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>New event</CardTitle>
            <CardDescription>Keep it structured. Garbage in → garbage out.</CardDescription>
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
              <div className="text-xs text-muted-foreground">Use local time; stored as string for demo.</div>
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

            <Button onClick={submit} disabled={loading} className="w-full">
              {loading ? "Recording..." : "Record event"}
            </Button>

            <div className="text-xs text-muted-foreground">
              This writes to a demo API store now. Next step: replace store with Supabase table + RLS.
            </div>
          </CardContent>
        </Card>

        {/* Recent ingested */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recently ingested</CardTitle>
            <CardDescription>Audit trail view: what entered the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshEvents}>Refresh</Button>
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
                        No ingested events yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground">
              Investor-grade point: this is the <span className="font-medium">data contract</span>. Storage backend can
              change without changing UI.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
