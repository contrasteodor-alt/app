"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { RecommendedAction } from "@/lib/engineering-demo";
import {
  demoEvents,
  demoShift,
  deriveMetrics,
  runDeterministicFindings,
  // If your engineering-demo exports types for events, great.
  // Otherwise we’ll infer from runtime shape.
} from "@/lib/engineering-demo";

type IngestedEvent = {
  id: string;
  createdAt: string;
  type: string;
  lineId: string;
  timestamp: string;
  durationMin?: number;
  qty?: number;
  category: string;
  comment?: string;
  operator?: string;
  station?: string;
  tags?: string[];
};

function pct(x: number) {
  if (!Number.isFinite(x)) return "n/a";
  return `${Math.round(x * 1000) / 10}%`;
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function tryParseJSONArray(s: string): any[] | null {
  const cleaned = (s || "")
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = cleaned.slice(start, end + 1);
    try {
      const parsed2 = JSON.parse(slice);
      if (Array.isArray(parsed2)) return parsed2;
    } catch {}
  }

  return null;
}

function mapIngestToEngineeringEvent(e: IngestedEvent) {
  // Shape expected by your existing analytics:
  // { id, timestamp, type, category, durationMin, comment }
  // Plus anything else you want to carry.
  return {
    id: e.id,
    timestamp: e.timestamp,
    type: e.type,
    category: e.category,
    durationMin: e.durationMin,
    comment: e.comment,
    lineId: e.lineId,
    qty: e.qty,
    station: e.station,
    operator: e.operator,
  };
}

export default function AIClientPage() {
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [rawAI, setRawAI] = useState<string>("");
  const [actions, setActions] = useState<RecommendedAction[]>([]);
  const [error, setError] = useState<string>("");

  const [useIngested, setUseIngested] = useState(true);
  const [ingestedEvents, setIngestedEvents] = useState<IngestedEvent[]>([]);

  const activeEvents = useMemo(() => {
    if (useIngested && ingestedEvents.length > 0) {
      return ingestedEvents.map(mapIngestToEngineeringEvent);
    }
    return demoEvents;
  }, [useIngested, ingestedEvents]);

  const metrics = useMemo(() => deriveMetrics(activeEvents as any, demoShift), [activeEvents]);
  const findings = useMemo(() => runDeterministicFindings(activeEvents as any, metrics), [activeEvents, metrics]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  async function loadIngested() {
    setLoadingEvents(true);
    setError("");

    try {
      const r = await fetch("/api/ingest/events", { method: "GET" });
      const contentType = r.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await r.json() : { error: await r.text() };

      if (!r.ok) {
        setError(data?.error || "Failed to load ingested events");
        return;
      }

      setIngestedEvents(data?.events || []);
    } catch (e: any) {
      setError(e?.message || "Network error while loading events");
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    // Load once on entry
    loadIngested();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runEngineeringReview() {
    setLoading(true);
    setError("");
    setRawAI("");
    setActions([]);

    try {
      const prompt = `
You are a senior manufacturing engineer. Be assertive but justified.

Rules:
- Only use provided data (no invented events/metrics).
- Output JSON array only (no markdown).
- 3 to 6 actions, ranked most important first.
- "expectedImpact" must be measurable (e.g. "+3–5% OEE", "-10 min/shift downtime").
- Tie each action to evidenceEventIds from the provided events.

DATA:
Shift Inputs: ${JSON.stringify(demoShift)}
Derived Metrics: ${JSON.stringify(metrics)}
Events: ${JSON.stringify(activeEvents)}
Deterministic Findings: ${JSON.stringify(findings)}

Output JSON schema:
[
  {
    "action": "string",
    "category": "Machine|Method|Material|Man|Other",
    "expectedImpact": "string",
    "confidence": "Low|Medium|High",
    "evidenceEventIds": ["ev_...","ev_..."]
  }
]
`.trim();

      const r = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const contentType = r.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await r.json() : { error: await r.text() };

      if (!r.ok) {
        setError(data?.error || "AI request failed");
        return;
      }

      const text = data?.text || "";
      setRawAI(text);

      const parsed = tryParseJSONArray(text);
      if (parsed) {
        setActions(parsed as RecommendedAction[]);
      } else {
        setError("AI returned output that could not be parsed as a JSON array. Showing raw output below.");
      }
    } catch (e: any) {
      setError(e?.message || "Network/server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Automated Engineering Review</h1>
          <p className="text-muted-foreground">
            Event intake → deterministic metrics/findings → AI actions tied to evidence.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Data source */}
      <Card>
        <CardHeader>
          <CardTitle>Data source</CardTitle>
          <CardDescription>Use ingested events (preferred) or fallback demo dataset.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button
            variant={useIngested ? "default" : "outline"}
            onClick={() => setUseIngested(true)}
          >
            Ingested events ({ingestedEvents.length})
          </Button>
          <Button
            variant={!useIngested ? "default" : "outline"}
            onClick={() => setUseIngested(false)}
          >
            Demo events ({demoEvents.length})
          </Button>
          <Button variant="secondary" onClick={loadIngested} disabled={loadingEvents}>
            {loadingEvents ? "Refreshing..." : "Refresh ingested"}
          </Button>
          <div className="text-xs text-muted-foreground">
            Note: current ingest store is in-memory for MVP; replace with DB next.
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Run analysis</CardTitle>
          <CardDescription>Strict JSON output for repeatable downstream UI.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={runEngineeringReview} disabled={loading}>
            {loading ? "Running..." : "Run engineering analysis"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setError("");
              setRawAI("");
              setActions([]);
            }}
            disabled={loading}
          >
            Clear results
          </Button>
          {error ? <p className="text-sm text-red-600 whitespace-pre-wrap w-full mt-2">{error}</p> : null}
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Derived metrics (deterministic)</CardTitle>
          <CardDescription>Computed from shift inputs + active event set.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Availability</div>
              <div className="text-xl font-semibold">{pct(clamp01(metrics.availability))}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Performance</div>
              <div className="text-xl font-semibold">{pct(clamp01(metrics.performance))}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Quality</div>
              <div className="text-xl font-semibold">{pct(clamp01(metrics.quality))}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">OEE</div>
              <div className="text-xl font-semibold">{pct(clamp01(metrics.oee))}</div>
            </div>
          </div>

          <Separator />

          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Events used:</span>{" "}
              {useIngested && ingestedEvents.length > 0 ? "Ingested" : "Demo"} ({activeEvents.length})
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Deterministic findings (rules)</CardTitle>
          <CardDescription>What we can conclude without AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rule-based findings triggered.</p>
          ) : (
            <ul className="space-y-2">
              {findings.map((f) => (
                <li key={f.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{f.description}</div>
                    <span className="text-xs rounded-full border px-2 py-0.5">{f.severity}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Evidence: {f.evidenceEventIds.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* AI Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended actions (AI)</CardTitle>
          <CardDescription>Must cite evidence event IDs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr className="border-b">
                    <th className="py-2 pr-4">Action</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Expected impact</th>
                    <th className="py-2 pr-4">Confidence</th>
                    <th className="py-2">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((a, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 pr-4">{a.action}</td>
                      <td className="py-2 pr-4">{a.category}</td>
                      <td className="py-2 pr-4">{a.expectedImpact}</td>
                      <td className="py-2 pr-4">{a.confidence}</td>
                      <td className="py-2 font-mono text-xs">
                        {(a.evidenceEventIds ?? []).join(", ") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Run analysis to generate actions.
            </p>
          )}

          {rawAI ? (
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground mb-2">Raw AI output</div>
              <pre className="whitespace-pre-wrap text-xs">{rawAI}</pre>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
