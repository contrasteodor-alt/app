"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useEffect, useState } from "react";

/* ======================
   TYPES
====================== */
type Event = {
  id: string;
  event_type: string;
  category: string;
  duration_min?: number;
  qty?: number;
  station?: string;
  comment?: string;
};

type ActionPlan = {
  id: string;
  action: string;
  root_cause: string;
  owner: string;
  due_date: string;
  status: string;
  evidence_event_ids: string[];
};

/* ======================
   CONTEXT
====================== */
function getLeanContext() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("lean-context");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ======================
   PAGE
====================== */
export default function ActionPlanPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [actions, setActions] = useState<ActionPlan[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  /* DECISION FORM */
  const [rootCause, setRootCause] = useState("");
  const [action, setAction] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");

  /* ======================
     INIT
  ====================== */
  useEffect(() => {
    const ctx = getLeanContext();
    if (!ctx?.orgId) return;
    init(ctx.orgId);
  }, []);

  async function init(orgId: string) {
    const shiftRes = await fetch(`/api/shifts/active?orgId=${orgId}`);
    const shiftJson = await shiftRes.json();
    if (!shiftJson.shiftId) return;

    await loadEvents(shiftJson.shiftId);
    await loadActions(shiftJson.shiftId);
  }

  async function loadEvents(shiftId: string) {
    setLoading(true);
    const res = await fetch(`/api/ingest/events?shiftId=${shiftId}`);
    const json = await res.json();
    setEvents(json.events || []);
    setLoading(false);
  }

  async function loadActions(shiftId: string) {
    const res = await fetch(`/api/actions?shiftId=${shiftId}`);
    const json = await res.json();
    setActions(json.actions || []);
  }

  /* ======================
     EVENT CLASSIFICATION
  ====================== */
  function getEventKey(e: Event) {
    return `${e.event_type}__${e.category}`;
  }

  const eventCounts = events.reduce<Record<string, number>>((acc, e) => {
    const key = getEventKey(e);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  /* ======================
     SHIFT KPI (DERIVED)
  ====================== */
  const totalDowntime = events
    .filter((e) => e.event_type === "downtime")
    .reduce((sum, e) => sum + (e.duration_min || 0), 0);

  const totalScrap = events
    .filter((e) => e.event_type === "scrap")
    .reduce((sum, e) => sum + (e.qty || 0), 0);

  /* ======================
     AI SUGGESTION
  ====================== */
  async function aiSuggestForEvents(eventIds: string[]) {
    const relatedEvents = events.filter((e) =>
      eventIds.includes(e.id)
    );

    const res = await fetch("/api/ai/action-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: relatedEvents }),
    });

    const json = await res.json();
    if (json?.suggestion) {
      setRootCause(json.suggestion.rootCause);
      setAction(json.suggestion.action);
    }
  }

  /* ======================
     CREATE ACTION PLAN
  ====================== */
  async function createActionPlan() {
    if (!rootCause || !action || !owner || !dueDate) {
      alert("All decision fields are mandatory");
      return;
    }

    const ctx = getLeanContext();
    if (!ctx?.orgId) return;

    const shiftRes = await fetch(`/api/shifts/active?orgId=${ctx.orgId}`);
    const shiftJson = await shiftRes.json();
    if (!shiftJson.shiftId) return;

    await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId: ctx.orgId,
        shiftId: shiftJson.shiftId,
        lineId: null,
        rootCause,
        action,
        owner,
        dueDate,
        status: "Open",
        aiSource: {
          evidenceEventIds: selectedEventIds,
        },
      }),
    });

    setShowDrawer(false);
    setSelectedEventIds([]);
    setRootCause("");
    setAction("");
    setOwner("");
    setDueDate("");

    init(ctx.orgId);
  }

  /* ======================
     RENDER
  ====================== */
  return (
    <div style={{ padding: 24 }}>
      <h1>Shift Review</h1>

      {/* SHIFT KPI HEADER */}
      <div style={{ border: "2px solid #000", padding: 12, marginBottom: 24 }}>
        <strong>Shift Performance Summary</strong>
        <div>Total Downtime: {totalDowntime} min</div>
        <div>Total Scrap: {totalScrap} pcs</div>
        <div>Events Recorded: {events.length}</div>
      </div>

      {selectedEventIds.length > 0 && (
        <button
          onClick={async () => {
            setShowDrawer(true);
            await aiSuggestForEvents(selectedEventIds);
          }}
        >
          Define Action ({selectedEventIds.length} event(s))
        </button>
      )}

      {loading && <p>Loading...</p>}

      <table border={1} width="100%" cellPadding={6}>
        <thead>
          <tr>
            <th></th>
            <th>Type</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Duration</th>
            <th>Station</th>
            <th>Comment</th>
            <th>Event Status</th>
            <th>Decision</th>
            <th>Owner</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {events.map((e) => {
            const key = getEventKey(e);
            const count = eventCounts[key];
            const eventStatus = count > 1 ? "Pattern" : "Needs Action";

            const actionPlan = actions.find((a) =>
              a.evidence_event_ids?.includes(e.id)
            );

            return (
              <tr key={e.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedEventIds.includes(e.id)}
                    onChange={() =>
                      setSelectedEventIds((prev) =>
                        prev.includes(e.id)
                          ? prev.filter((id) => id !== e.id)
                          : [...prev, e.id]
                      )
                    }
                  />
                </td>

                <td>{e.event_type}</td>
                <td>{e.category}</td>
                <td>{e.qty ?? "-"}</td>
                <td>{e.duration_min ?? "-"}</td>
                <td>{e.station ?? "-"}</td>
                <td>{e.comment ?? "-"}</td>

                <td>{eventStatus}</td>
                <td>{actionPlan ? actionPlan.action : "Decision pending"}</td>
                <td>{actionPlan?.owner ?? "-"}</td>
                <td>{actionPlan?.due_date ?? "-"}</td>
                <td>{actionPlan?.status ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* DECISION DRAWER */}
      {showDrawer && (
        <div style={{ marginTop: 24, padding: 16, border: "3px solid #000" }}>
          <h3>Manager Decision (AI pre-filled)</h3>

          <button onClick={() => aiSuggestForEvents(selectedEventIds)}>
            Regenerate AI suggestion
          </button>

          <label>Root Cause *</label>
          <textarea
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
          />

          <label>Action *</label>
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />

          <label>Owner *</label>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />

          <label>Due Date *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <br />
          <button onClick={createActionPlan}>Confirm Decision</button>
          <button onClick={() => setShowDrawer(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
