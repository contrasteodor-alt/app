"use client";

import { useEffect, useState } from "react";

type Event = {
  id: string;
  event_type: string;
  category: string;
  occurred_at: string;
  duration_min?: number;
  qty?: number;
  station?: string;
  operator?: string;
  comment?: string;
};

type ActionPlan = {
  id: string;
  action: string;
  root_cause: string;
  owner: string;
  due_date: string;
  status: string;
  source: string;
};

export default function ActionPlanPage() {
  // CONTEXT (hardcoded for now – later din context / selector)
  const orgId = "ORG_1";
  const lineId = "LINE_1";
  const shiftId = ""; // optional

  // STATE
  const [events, setEvents] = useState<Event[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // FORM STATE
  const [action, setAction] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");

  /* ======================
     DATA LOAD
  ====================== */
  useEffect(() => {
    loadEvents();
    loadActions();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const res = await fetch(
      `/api/ingest/events${shiftId ? `?shiftId=${shiftId}` : ""}`
    );
    const json = await res.json();
    setEvents(json.events || []);
    setLoading(false);
  }

  async function loadActions() {
    const res = await fetch(`/api/actions`);
    const json = await res.json();
    setActionPlans(json.actions || []);
  }

  /* ======================
     EVENT SELECTION
  ====================== */
  function toggleEvent(id: string) {
    setSelectedEventIds((prev) =>
      prev.includes(id)
        ? prev.filter((e) => e !== id)
        : [...prev, id]
    );
  }

  /* ======================
     CREATE ACTION PLAN
  ====================== */
  async function createActionPlan() {
    if (!action || !rootCause || !owner || !dueDate) {
      alert("Complete all fields");
      return;
    }

    const res = await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        lineId,
        action,
        rootCause,
        owner,
        dueDate,
        status: "Open",
        aiSource: {
          evidenceEventIds: selectedEventIds,
        },
      }),
    });

    if (!res.ok) {
      alert("Failed to create action");
      return;
    }

    // RESET
    setShowDrawer(false);
    setSelectedEventIds([]);
    setAction("");
    setRootCause("");
    setOwner("");
    setDueDate("");

    loadActions();
  }

  /* ======================
     RENDER
  ====================== */
  return (
    <div style={{ padding: 24 }}>
      <h1>Action Plan</h1>

      {/* EVENTS */}
      <h2>Registered Events</h2>
      {loading && <p>Loading events...</p>}

      <table border={1} cellPadding={6} cellSpacing={0} width="100%">
        <thead>
          <tr>
            <th></th>
            <th>Type</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Duration</th>
            <th>Station</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedEventIds.includes(e.id)}
                  onChange={() => toggleEvent(e.id)}
                />
              </td>
              <td>{e.event_type}</td>
              <td>{e.category}</td>
              <td>{e.qty ?? "-"}</td>
              <td>{e.duration_min ?? "-"}</td>
              <td>{e.station ?? "-"}</td>
              <td>{e.comment ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedEventIds.length > 0 && (
        <button
          style={{ marginTop: 16 }}
          onClick={() => setShowDrawer(true)}
        >
          Create Action Plan
        </button>
      )}

      {/* DRAWER */}
      {showDrawer && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #333",
          }}
        >
          <h3>Create Action Plan</h3>

          <div>
            <label>Root Cause</label>
            <br />
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
            />
          </div>

          <div>
            <label>Action</label>
            <br />
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
          </div>

          <div>
            <label>Owner</label>
            <br />
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>

          <div>
            <label>Due Date</label>
            <br />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <br />
          <button onClick={createActionPlan}>Save</button>
          <button onClick={() => setShowDrawer(false)}>Cancel</button>
        </div>
      )}

      {/* ACTION PLANS */}
      <h2 style={{ marginTop: 32 }}>Open Action Plans</h2>

      <table border={1} cellPadding={6} cellSpacing={0} width="100%">
        <thead>
          <tr>
            <th>Action</th>
            <th>Owner</th>
            <th>Due</th>
            <th>Status</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {actionPlans.map((a) => (
            <tr key={a.id}>
              <td>{a.action}</td>
              <td>{a.owner}</td>
              <td>{a.due_date}</td>
              <td>{a.status}</td>
              <td>{a.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
