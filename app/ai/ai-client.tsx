"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { RecommendedAction } from "@/lib/engineering-demo";
import { demoEvents, demoShift, deriveMetrics, runDeterministicFindings } from "@/lib/engineering-demo";

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

export default function AIClientPage() {
  const [loading, setLoading] = useState(false);
  const [rawAI, setRawAI] = useState<string>("");
  const [actions, setActions] = useState<RecommendedAction[]>([]);
  const [error, setError] = useState<string>("");

  const metrics = useMemo(() => deriveMetrics(demoEvents, demoShift), []);
  const findings = useMemo(() => runDeterministicFindings(demoEvents, metrics), [metrics]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

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
Events: ${JSON.stringify(demoEvents)}
Deterministic Findings: ${JSON.stringify(findings)}

Output JSON schema:
[
  {
    "action": "string",
    "category": "Machine|Method|Material|Man|Other",
    "expectedImpact": "string",
    "confidence": "Low|Medium|High",
    "evidenceEventIds": ["e1","e2"]
  }
]
`.trim();

      const r = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await r.json();

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
            Engineering-first analysis pipeline: Events → Metrics → Findings → Actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Run standard analysis</CardTitle>
          <CardDescription>
            Uses the demo factory dataset and strict JSON output for repeatability.
          </CardDescription>
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

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>Event log</CardTitle>
          <CardDescription>Structured production events (engineering source of truth).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Comment</th>
                <th className="py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {demoEvents.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-2 pr-4">{e.timestamp}</td>
                  <td className="py-2 pr-4">{e.type}</td>
                  <td className="py-2 pr-4">{e.category}</td>
                  <td className="py-2 pr-4">{e.durationMin != null ? `${e.durationMin} min` : "—"}</td>
                  <td className="py-2 pr-4">{e.comment ?? "—"}</td>
                  <td className="py-2 font-mono">{e.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Derived metrics (deterministic)</CardTitle>
          <CardDescription>Computed from shift inputs + events (repeatable).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Availability</div>
              <div className="text-xl font-semibold">{pct(clamp01(metrics.availability))}</div>
              <div className="text-xs text-muted-foreground mt-1">(Planned − Downtime) / Planned</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Performance</div>
              <div className="text-xl font-semibold">{pct(clamp01(metrics.performance))}</div>
              <div className="text-xs text-muted-foreground mt-1">(Output × Ideal CT) / Runtime</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Quality</div>
              <div className="text-xl font-semibold">{pct(clamp01(metrics.quality))}</div>
              <div className="text-xs text-muted-foreground mt-1">(Good / Total)</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">OEE</div>
              <div className="text-xl font-semibold">{pct(clamp01(metrics.oee))}</div>
              <div className="text-xs text-muted-foreground mt-1">A × P × Q</div>
            </div>
          </div>

          <Separator />

          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">Planned time:</span> {demoShift.plannedTimeMin} min
            </div>
            <div>
              <span className="font-medium">Downtime + changeover:</span> {metrics.downtimeMin} min
            </div>
            <div>
              <span className="font-medium">Output:</span> {demoShift.outputUnits} units
            </div>
            <div>
              <span className="font-medium">Scrap:</span> {demoShift.scrapUnits} units
            </div>
            <div>
              <span className="font-medium">Ideal cycle:</span> {demoShift.idealCycleSec} sec
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Deterministic findings (rules)</CardTitle>
          <CardDescription>Conclusions the system can make without AI.</CardDescription>
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
          <CardDescription>Assertive recommendations, tied to evidence events.</CardDescription>
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
              Click <span className="font-medium">Run engineering analysis</span> to generate actions.
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
