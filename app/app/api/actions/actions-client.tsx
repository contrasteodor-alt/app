"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ActionPlan = {
  id: string;
  org_id: string;
  line_id: string;
  shift_id: string | null;
  event_ids: string[];
  action: string;
  root_cause: string;
  owner: string;
  due_date: string;
  status: "Open" | "Closed" | "Delayed" | "Canceled";
  created_at: string;
  closed_at: string | null;
};

export default function ActionsClient() {
  const [actions, setActions] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function loadActions() {
    setLoading(true);
    setErr("");

    try {
      const r = await fetch("/api/actions");
      const data = await r.json();

      if (!r.ok) {
        setErr(data?.error || "Failed to load actions");
        return;
      }

      setActions(data.actions || []);
    } catch {
      setErr("Network error while loading actions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Action Plan
          </h1>
          <p className="text-muted-foreground">
            Engineering actions derived from production evidence.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/">Back to cockpit</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open & historical actions</CardTitle>
        </CardHeader>

        <CardContent>
          {err && (
            <p className="text-sm text-red-600 mb-4">{err}</p>
          )}

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4">Line</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Root cause</th>
                  <th className="py-2 pr-4">Owner</th>
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Evidence</th>
                </tr>
              </thead>

              <tbody>
                {actions.map((a) => (
                  <tr key={a.id} className="border-b align-top">
                    <td className="py-2 pr-4">{a.line_id}</td>
                    <td className="py-2 pr-4">{a.action}</td>
                    <td className="py-2 pr-4">{a.root_cause}</td>
                    <td className="py-2 pr-4">{a.owner}</td>
                    <td className="py-2 pr-4">
                      {new Date(a.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4">{a.status}</td>
                    <td className="py-2">
                      {a.event_ids.length}
                    </td>
                  </tr>
                ))}

                {actions.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No action plans created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
