"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function AIPage() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const r = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await r.json();

      if (!r.ok) {
        setError(data?.error || "Request failed");
        return;
      }

      setAnswer(data?.text || "(empty response)");
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">AI assistant</h1>
        <p className="text-muted-foreground">Ask questions about your operations data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
          <CardDescription>
            Runs server-side (OPENAI_API_KEY stays private). Try “Create a PDCA for high scrap on Line 1”.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Summarize downtime by line for the last 24h."
            rows={5}
          />

          <div className="flex gap-2">
            <Button onClick={askAI} disabled={loading || !prompt.trim()}>
              {loading ? "Thinking..." : "Ask AI"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setPrompt("");
                setAnswer("");
                setError("");
              }}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

          {error ? (
            <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
          ) : null}

          {answer ? (
            <Card>
              <CardHeader>
                <CardTitle>Answer</CardTitle>
                <CardDescription>Structured Lean response</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">{answer}</pre>
              </CardContent>
            </Card>
          ) : (
            <p className="text-xs text-muted-foreground">
              Tip: Ask for “5 Why”, “Pareto ideas”, “countermeasures”, “standard work update”.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
