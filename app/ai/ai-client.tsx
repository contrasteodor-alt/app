"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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

      if (!res.ok) {
        throw new Error("AI request failed");
      }

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

      actionDate: today(),
      action: item.action,
      rootCause: `${item.category} issue detected by AI`,
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
      alert("Failed to create action plan");
      return;
    }

    alert("✅ Action added to Action Plan");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          AI Operations Engineer
        </h1>
        <p className="text-muted-foreground">
          Analyze production data and generate actionable engineering actions.
        </p>
      </div>

      {/* Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis prompt</CardTitle>
          <CardDescription>
            Ask about downtime, scrap, OEE, bottlenecks, or trends.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Analyze downtime causes for the last 24h shift and propose actions."
            rows={4}
          />
          <Button onClick={runAI} disabled={loading || !prompt}>
            {loading ? "Analyzing…" : "Ask AI"}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-300">
          <CardContent className="text-sm text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Recommendations</h2>

          {results.map((item, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base">
                  {item.action}
                </CardTitle>
                <CardDescription>
                  Expected impact: {item.expectedImpact}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Category: {item.category}
                  </Badge>
                  <Badge
                    variant={
                      item.confidence === "High"
                        ? "default"
                        : "secondary"
                    }
                  >
                    Confidence: {item.confidence}
                  </Badge>
                </div>

                {item.evidenceEventIds?.length ? (
                  <p className="text-xs text-muted-foreground">
                    Evidence events: {item.evidenceEventIds.join(", ")}
                  </p>
                ) : null}

                <Button
                  variant="outline"
                  onClick={() => createActionFromAI(item)}
                >
                  Create action plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
