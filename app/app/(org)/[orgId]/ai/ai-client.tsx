"use client";

import { useState } from "react";

type AISuggestion = {
  action: string;
  category: string;
  expectedImpact: string;
  confidence: string;
  evidenceEventIds?: string[];
};

export default function AIClientPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runAI() {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("AI request failed");

      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function createActionFromAI(item: AISuggestion) {
    const payload = {
      orgId: "demo-org",
      lineId: "line-1",

      action: item.action,
      rootCause: `${item.category} identified from production events`,
      owner: "Production Engineering",
      dueDate: addDays(7),
      status: "Open",

      aiSource: {
        confidence: item.confidence,
        expectedImpact: item.expectedImpact,
        evidenceEventIds: item.evidenceEventIds ?? [],
      },
    };

    const res = await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Create action failed");
      alert("Failed to create action plan");
      return;
    }

    alert("✅ AI action registered in Action Plan");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">AI Operations Engineer</h1>
        <p className="text-gray-500">
          Analyze production data and generate actionable engineering actions.
        </p>
      </div>

      {/* Prompt */}
      <div className="rounded border p-4 space-y-3">
        <h2 className="font-medium">Analysis prompt</h2>
        <p className="text-sm text-gray-500">
          Ask about downtime, scrap, OEE, bottlenecks, or trends.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="e.g. Analyze downtime causes for the last 24h shift and propose actions."
          className="w-full rounded border p-2 text-sm"
        />

        <button
          onClick={runAI}
          disabled={loading || !prompt}
          className="rounded bg-black px-4 py-2 text-white text-sm disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Ask AI"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded border border-red-300 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Recommendations</h2>

          {results.map((item, idx) => (
            <div key={idx} className="rounded border p-4 space-y-3">
              <div>
                <h3 className="font-medium">{item.action}</h3>
                <p className="text-sm text-gray-500">
                  Expected impact: {item.expectedImpact}
                </p>
              </div>

              <div className="flex gap-2 text-xs">
                <span className="rounded border px-2 py-1">
                  Category: {item.category}
                </span>
                <span className="rounded border px-2 py-1">
                  Confidence: {item.confidence}
                </span>
              </div>

              {item.evidenceEventIds?.length ? (
                <p className="text-xs text-gray-500">
                  Evidence events: {item.evidenceEventIds.join(", ")}
                </p>
              ) : null}

              <button
                onClick={() => createActionFromAI(item)}
                className="rounded border px-3 py-1 text-sm"
              >
                Create action plan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
