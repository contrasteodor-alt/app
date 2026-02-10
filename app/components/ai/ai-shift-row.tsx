"use client";

import { useState } from "react";



type Props = {
  orgId: string;
  suggestionId: string;
  lineLabel: string;
  eventType: string;
  failureMode: string;
  eventCount: number;
  impact: number;
  suggestedActionType: string;
};


export function AiShiftRow({
  orgId,
  suggestionId,
  lineLabel,
  eventType,
  failureMode,
  eventCount,
  impact,
  suggestedActionType,
}: Props) {
  console.log("AI suggestionId:", suggestionId);


  const [loading, setLoading] = useState(false);

  async function decide(decision: "accept" | "reject") {
    setLoading(true);

    await fetch(`/${orgId}/ai/suggestions/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestionId, decision }),
    });
    
    

    window.location.href = window.location.pathname;

  }

  if (!orgId) {
    console.error("AiShiftRow: orgId is undefined");
  }
  

  return (
    <div className="rounded-md border px-4 py-3 flex items-center justify-between">
      <div className="space-y-1">
        <div className="font-medium">{lineLabel}</div>

        <div className="text-sm text-muted-foreground">
          {eventType.toUpperCase()} · {failureMode}
        </div>

        <div className="text-xs text-muted-foreground">
          Events: {eventCount} · Impact: {impact}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={() => decide("accept")}
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm disabled:opacity-50"
          >
            Accept
          </button>

          <button
            disabled={loading}
            onClick={() => decide("reject")}
            className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
          >
            Reject
          </button>
        </div>

        <span className="text-xs text-muted-foreground">
          {suggestedActionType.replace("_", " ")} · pending
        </span>
      </div>
    </div>
  );
}
