"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function InsertDataPage() {
  const router = useRouter();
  const { orgId } = useParams<{ orgId: string }>();

  const [file, setFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleExcelImport() {
    if (!file) return;

    setImportLoading(true);
    setImportError(null);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/import/excel?orgId=${orgId}`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      setImportResult(json);

      if (!res.ok) {
        setImportError(json?.error || "Import failed");
      }
    } catch {
      setImportError("Network or server error");
    } finally {
      setImportLoading(false);
    }
  }

  const [shift, setShift] = useState({
    date: new Date().toISOString().slice(0, 10),
    shift: "A",
    lineId: "",
    product: "",
    targetPerHour: 60,
    plannedMinutes: 480,
  });

  const [downtime, setDowntime] = useState<any[]>([]);
  const [scrap, setScrap] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function onSubmit() {
    try {
      setSaving(true);
      setSaveError(null);

      const res = await fetch("/api/ingest/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shift, downtime, scrap }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSaveError(data?.error || "Failed to save shift");
        setSaving(false);
        return;
      }

      router.push(`/${orgId}`);
      router.refresh();
    } catch (e: any) {
      setSaveError(e?.message || "Unexpected error");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>Import Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button onClick={handleExcelImport} disabled={!file || importLoading}>
            {importLoading ? "Importing…" : "Import Excel"}
          </Button>

          {importLoading && <p className="text-sm">⏳ Processing file…</p>}
          {importError && (
            <p className="text-sm text-red-600">{importError}</p>
          )}

          {importResult && (
            <pre className="max-h-64 overflow-auto rounded bg-black p-3 text-xs text-green-400">
              {JSON.stringify(importResult, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <h1 className="text-2xl font-semibold">Shift Ingest</h1>

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
            onValueChange={(v) => setShift({ ...shift, shift: v })}
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
            onChange={(e) =>
              setShift({ ...shift, lineId: e.target.value })
            }
          />

          <Input
            placeholder="Product"
            value={shift.product}
            onChange={(e) =>
              setShift({ ...shift, product: e.target.value })
            }
          />

          <Input
            type="number"
            placeholder="Target / hour"
            value={shift.targetPerHour}
            onChange={(e) =>
              setShift({
                ...shift,
                targetPerHour: Number(e.target.value),
              })
            }
          />

          <Input
            type="number"
            placeholder="Planned minutes"
            value={shift.plannedMinutes}
            onChange={(e) =>
              setShift({
                ...shift,
                plannedMinutes: Number(e.target.value),
              })
            }
          />
        </CardContent>
      </Card>

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

      {saveError && <p className="text-red-600">{saveError}</p>}

      <Button onClick={onSubmit} disabled={saving}>
        {saving ? "Saving…" : "Save shift"}
      </Button>
    </div>
  );
}
