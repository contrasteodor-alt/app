"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* ================= TYPES ================= */

type EventType = "downtime" | "changeover" | "scrap" | "quality" | "note";

type NewEvent = {
  type: EventType;
  lineId: string;
  timestamp: string;
  durationMin?: number;
  qty?: number;
  category: string;
  comment?: string;
  operator?: string;
  station?: string;
};

type StoredEvent = NewEvent & {
  id: string;
};

type ShiftHeader = {
  id: string;
  shift_name: string;
  started_at: string;
  planned_time_min: number;
  ideal_cycle_sec: number;
  output_units: number;
  scrap_units: number;
};

/* ================= CONSTS ================= */

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

/* ================= HELPERS ================= */

function nowLocalISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function isPositiveInt(n: any) {
  return Number.isInteger(n) && n > 0;
}

/* ================= COMPONENT ================= */

export default function IngestClient() {
  const params = useParams();
  const orgId = params.orgId as string; // ✅ FIXED

  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingShift, setLoadingShift] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState("");

  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [shift, setShift] = useState<ShiftHeader | null>(null);

  const [shiftForm, setShiftForm] = useState({
    shiftName: "A",
    startedAt: new Date().toISOString(),
    plannedTimeMin: 450,
    idealCycleSec: 12,
    outputUnits: 1200,
    scrapUnits: 18,
  });

  const [form, setForm] = useState<NewEvent>({
    type: "downtime",
    lineId: "line-1",
    timestamp: nowLocalISO(),
    durationMin: 10,
    category: CATEGORY_BY_TYPE.downtime[0],
    comment: "",
  });

  const categories = useMemo(
    () => CATEGORY_BY_TYPE[form.type],
    [form.type]
  );

  /* ================= API ================= */

  async function loadShift() {
    setLoadingShift(true);
    setErr(null);

    try {
      const r = await fetch("/api/ingest/shift");
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      setShift(data.shift ?? null);
    } catch (e: any) {
      setErr(e.message || "Failed to load shift");
    } finally {
      setLoadingShift(false);
    }
  }

  async function refreshEvents() {
    if (!shift?.id) return;

    setLoadingEvents(true);
    setErr(null);

    try {
      const r = await fetch(
        `/api/ingest/events?orgId=${orgId}&shiftId=${shift.id}`
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      setEvents(data.events ?? []);
    } catch (e: any) {
      setErr(e.message || "Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function saveShift() {
    setLoadingShift(true);
    setErr(null);

    try {
      const r = await fetch("/api/ingest/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, ...shiftForm }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      setShift(data.shift);
      setOkMsg("Shift saved");
    } catch (e: any) {
      setErr(e.message || "Failed to save shift");
    } finally {
      setLoadingShift(false);
    }
  }

  async function submitEvent() {
    if (!shift?.id) {
      setErr("Save shift first");
      return;
    }

    const needsDuration =
      form.type === "downtime" || form.type === "changeover";
    const needsQty =
      form.type === "scrap" || form.type === "quality";

    if (needsDuration && !isPositiveInt(form.durationMin)) {
      setErr("Duration must be positive");
      return;
    }
    if (needsQty && !isPositiveInt(form.qty)) {
      setErr("Qty must be positive");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/ingest/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          shiftId: shift.id,
          ...form,
        }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      setOkMsg("Event recorded");
      setForm((p) => ({ ...p, timestamp: nowLocalISO() }));
      refreshEvents();
    } catch (e: any) {
      setErr(e.message || "Failed to ingest");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShift();
  }, []);

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Ingest</h1>

      <div className="flex gap-2">
        <Link className="underline" href={`/org/${orgId}`}>
          Back to org
        </Link>
        <Link className="underline" href={`/org/${orgId}/ai`}>
          AI review
        </Link>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}
      {okMsg && <p className="text-green-600 text-sm">{okMsg}</p>}

      <div className="border rounded p-4 space-y-3">
        <h2 className="font-medium">Shift header</h2>
        <button
          onClick={saveShift}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loadingShift ? "Saving…" : "Save shift"}
        </button>
      </div>

      <div className="border rounded p-4 space-y-3">
        <h2 className="font-medium">New event</h2>

        <select
          value={form.type}
          onChange={(e) =>
            setForm((p) => ({ ...p, type: e.target.value as EventType }))
          }
          className="border p-2 rounded w-full"
        >
          {Object.keys(CATEGORY_BY_TYPE).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          onClick={submitEvent}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Recording…" : "Record event"}
        </button>
      </div>

      <div className="border rounded p-4 space-y-2">
        <h2 className="font-medium">Recent events</h2>

        <button
          onClick={refreshEvents}
          className="underline text-sm"
          disabled={loadingEvents}
        >
          Refresh
        </button>

        {events.length === 0 && (
          <p className="text-sm text-gray-500">No events yet</p>
        )}

        {events.map((e) => (
          <div key={e.id} className="text-sm border-b py-1">
            {e.type} • {e.category} • {e.timestamp}
          </div>
        ))}
      </div>
    </div>
  );
}
