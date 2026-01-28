"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";



const DOWNTIME_REASONS = [
  "Maintenance",
  "Quality",
  "Material",
  "Manpower",
  "Setup",
  "Other",
];

const SCRAP_REASONS = [
  "Quality",
  "Setup",
  "Material",
  "Process",
  "Other",
];

export default function IngestPage() {
  const router = useRouter();
  const { orgId } = useParams<{ orgId: string }>();

  // ─────────────────────────────
  // Shift header
  // ─────────────────────────────
  const [shift, setShift] = useState({
    date: new Date().toISOString().slice(0, 10),
    shift: "A",
    lineId: "",
    product: "",
    targetPerHour: 60,
    plannedMinutes: 480,
  });

  // ─────────────────────────────
  // Downtime & Scrap
  // ─────────────────────────────
  const [downtime, setDowntime] = useState<any[]>([]);
  const [scrap, setScrap] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────
  // Handlers
  // ─────────────────────────────
  async function onSubmit() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/ingest/shift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shift,
        downtime,
        scrap,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save shift");
      setLoading(false);
      return;
    }

    router.push(`/org/${orgId}/overview`);
    router.refresh();
  }

  // ─────────────────────────────
  // Render
  // ─────────────────────────────
  return (
    <div className="space-y-6 p-6 max-w-5xl">
      <h1 className="text-2xl font-semibold">Shift Ingest</h1>

      {/* ───── Shift Context ───── */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Context</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            value={shift.date}
            onChange={(e) => setShift({ ...shift, date: e.target.value })}
          />

<Select
  value={shift.shift}
  onValueChange={(v) => setShift({ ...shift, shift: v as "A" | "B" | "C" })}
>
  <SelectTrigger>
    <SelectValue placeholder="Shift" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="A">A</SelectItem>
    <SelectItem value="B">B</SelectItem>
    <SelectItem value="C">C</SelectItem>
  </SelectContent>
</Select>


          <Input
            placeholder="Line ID"
            value={shift.lineId}
            onChange={(e) => setShift({ ...shift, lineId: e.target.value })}
          />

          <Input
            placeholder="Product"
            value={shift.product}
            onChange={(e) => setShift({ ...shift, product: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Target / hour"
            value={shift.targetPerHour}
            onChange={(e) =>
              setShift({ ...shift, targetPerHour: Number(e.target.value) })
            }
          />

          <Input
            type="number"
            placeholder="Planned minutes"
            value={shift.plannedMinutes}
            onChange={(e) =>
              setShift({ ...shift, plannedMinutes: Number(e.target.value) })
            }
          />
        </CardContent>
      </Card>

      {/* ───── Downtime ───── */}
      <Card>
        <CardHeader>
          <CardTitle>Downtime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {downtime.map((d, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <Input
                type="number"
                placeholder="Minutes"
                value={d.minutes}
                onChange={(e) => {
                  const copy = [...downtime];
                  copy[i].minutes = Number(e.target.value);
                  setDowntime(copy);
                }}
              />

<Select
  value={d.reason}
  onValueChange={(v) => {
    const copy = [...downtime];
    copy[i].reason = v;
    setDowntime(copy);
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Reason" />
  </SelectTrigger>
  <SelectContent>
    {DOWNTIME_REASONS.map((r) => (
      <SelectItem key={r} value={r}>
        {r}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


              <Input
                placeholder="Details"
                value={d.details}
                onChange={(e) => {
                  const copy = [...downtime];
                  copy[i].details = e.target.value;
                  setDowntime(copy);
                }}
              />

              <Input
                placeholder="Reaction"
                value={d.reaction}
                onChange={(e) => {
                  const copy = [...downtime];
                  copy[i].reaction = e.target.value;
                  setDowntime(copy);
                }}
              />
            </div>
          ))}

          <Button
            variant="secondary"
            onClick={() =>
              setDowntime([
                ...downtime,
                { minutes: 0, reason: "", details: "", reaction: "" },
              ])
            }
          >
            + Add downtime
          </Button>
        </CardContent>
      </Card>

      {/* ───── Scrap ───── */}
      <Card>
        <CardHeader>
          <CardTitle>Scrap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scrap.map((s, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <Input
                type="number"
                placeholder="Qty"
                value={s.qty}
                onChange={(e) => {
                  const copy = [...scrap];
                  copy[i].qty = Number(e.target.value);
                  setScrap(copy);
                }}
              />

<Select
  value={s.reason}
  onValueChange={(v) => {
    const copy = [...scrap];
    copy[i].reason = v;
    setScrap(copy);
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Scrap reason" />
  </SelectTrigger>

  <SelectContent>
    {SCRAP_REASONS.map((r) => (
      <SelectItem key={r} value={r}>
        {r}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


              <Input
                placeholder="Details"
                value={s.details}
                onChange={(e) => {
                  const copy = [...scrap];
                  copy[i].details = e.target.value;
                  setScrap(copy);
                }}
              />

              <Input
                placeholder="Reaction"
                value={s.reaction}
                onChange={(e) => {
                  const copy = [...scrap];
                  copy[i].reaction = e.target.value;
                  setScrap(copy);
                }}
              />
            </div>
          ))}

          <Button
            variant="secondary"
            onClick={() =>
              setScrap([
                ...scrap,
                { qty: 0, reason: "", details: "", reaction: "" },
              ])
            }
          >
            + Add scrap
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-red-600">{error}</p>}

      <Button onClick={onSubmit} disabled={loading}>
        {loading ? "Saving…" : "Save shift"}
      </Button>
    </div>
  );
}
