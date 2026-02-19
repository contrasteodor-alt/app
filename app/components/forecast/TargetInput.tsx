"use client";

import { useState } from "react";

export function TargetInput({
  orgId,
  lineId,
  metric,
  initialValue,
}: {
  orgId: string;
  lineId: string;
  metric: string;
  initialValue: number | null;
}) {
  const [value, setValue] = useState(
    initialValue ? (initialValue * 100).toFixed(1) : ""
  );
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!value) return;

    setLoading(true);

    await fetch("/api/update-target", {
      method: "POST",
      body: JSON.stringify({
        orgId,
        lineId,
        metric,
        target: parseFloat(value) / 100,
      }),
    });

    setLoading(false);
    location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 border rounded px-2 py-1 text-sm"
      />
      <span className="text-sm">%</span>
      <button
        onClick={save}
        disabled={loading}
        className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
      >
        Save
      </button>
    </div>
  );
}
