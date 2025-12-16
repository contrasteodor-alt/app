"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { demoEvents, demoShift, deriveMetrics, runDeterministicFindings } from "@/lib/engineering-demo";

function pct(x: number) {
  if (!Number.isFinite(x)) return "n/a";
  return `${Math.round(x * 1000) / 10}%`;
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export default function HomeClient() {
  const metrics = useMemo(() => deriveMetrics(demoEvents, demoShift), []);
  const findings = useMemo(() => runDeterministicFindings(demoEvents, metrics), [metrics]);

  const downtimeMin = metrics.downtimeMin;
  const scrapRate = demoShift.outputUnits > 0 ? demoShift.scrapUnits / demoShift.outputUnits : 0;

  const lossByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of demoEvents) {
      const key = e.category;
      const val = e.durationMin ?? 0;
      map.set(key, (map.get(key) ?? 0) + val);
    }
    // only meaningful for downtime/changeover; scrap has no duration, but keep category visible
    return Array.from(map.entries())
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
      .slice(0, 5);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Factory Cockpit</h1>
          <p className="text-muted-foreground">
            Engineering-first overview. Fast truth → fast action. (Demo factory dataset)
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/ai">Run shift review (AI)</Link>
          </Button>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">OEE</CardTitle>
            <CardDescription>Availability × Performance × Quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{pct(clamp01(metrics.oee))}</div>
            <div className="text-xs text-muted-foreground mt-1">Target: ≥ 70% (demo)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Downtime + Changeover</CardTitle>
            <CardDescription>Loss time (min / shift)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{downtimeMin} min</div>
            <div className="text-xs text-muted-foreground mt-1">
              Planned: {demoShift.plannedTimeMin} min
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Scrap rate</CardTitle>
            <CardDescription>Scrap / Output</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{pct(clamp01(scrapRate))}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Scrap: {demoShift.scrapUnits} / Output: {demoShift.outputUnits}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open findings</CardTitle>
            <CardDescription>Rules-based alerts (deterministic)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{findings.length}</div>
            <div className="text-xs text-muted-foreground mt-1">No AI required</div>
          </CardContent>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Findings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Engineering findings</CardTitle>
            <CardDescription>What we can state with confidence from data + rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {findings.length === 0 ? (
              <div className="text-sm text-muted-foreground">No findings triggered.</div>
            ) : (
              <ul className="space-y-2">
                {findings.map((f) => (
                  <li key={f.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{f.description}</div>
                      <span className="text-xs rounded-full border px-2 py-0.5">{f.severity}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Evidence events: <span className="font-mono">{f.evidenceEventIds.join(", ")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/ai">Generate actions (AI)</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/ingest">Ingest data</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/improvement/kaizen">Kaizen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Loss breakdown + recent events */}
        <Card>
          <CardHeader>
            <CardTitle>Loss breakdown</CardTitle>
            <CardDescription>Where time is going (top categories)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {lossByCategory.length === 0 ? (
                <div className="text-sm text-muted-foreground">No loss data.</div>
              ) : (
                lossByCategory.map(([cat, mins]) => (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <div>{cat}</div>
                    <div className="font-mono">{mins} min</div>
                  </div>
                ))
              )}
              <div className="text-xs text-muted-foreground">
                Note: Scrap events shown separately; downtime/changeover are duration-based.
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium">Recent events</div>
              <ul className="space-y-2">
                {demoEvents.slice(0, 4).map((e) => (
                  <li key={e.id} className="rounded-lg border p-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">{e.type} • {e.category}</div>
                      <div className="text-xs font-mono">{e.id}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.timestamp} {e.durationMin != null ? `• ${e.durationMin} min` : ""}{e.comment ? ` • ${e.comment}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer / demo note */}
      <Card>
        <CardHeader>
          <CardTitle>System stance</CardTitle>
          <CardDescription>How this replaces engineering bandwidth without hallucinating.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div>
            1) Deterministic layer computes metrics + triggers findings. (No AI.)
          </div>
          <div>
            2) AI layer only recommends actions and must cite evidence event IDs.
          </div>
          <div>
            3) Traceability is the product: actions ↔ events ↔ metrics.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
