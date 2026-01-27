// lib/engineering-demo.ts

export type LossCategory = "Machine" | "Method" | "Material" | "Man" | "Other";

export type ProductionEvent = {
  id: string;
  timestamp: string; // ISO-ish string
  type: "Downtime" | "Changeover" | "Scrap";
  category: LossCategory;
  durationMin?: number;
  comment?: string;
};

export type ShiftInputs = {
  plannedTimeMin: number;
  idealCycleSec: number;
  outputUnits: number;
  scrapUnits: number;
};

export type DerivedMetrics = {
  downtimeMin: number;
  availability: number; // 0..1
  performance: number;  // 0..1 (can exceed 1 in real life; we’ll clamp in UI)
  quality: number;      // 0..1
  oee: number;          // 0..1
};

export type Finding = {
  id: string;
  severity: "Low" | "Medium" | "High";
  description: string;
  evidenceEventIds: string[];
};

export type RecommendedAction = {
  action: string;
  category: LossCategory;
  expectedImpact: string;
  confidence: "Low" | "Medium" | "High";
  evidenceEventIds?: string[];
};

export const demoShift: ShiftInputs = {
  plannedTimeMin: 480,
  idealCycleSec: 12,
  outputUnits: 420,
  scrapUnits: 18,
};

export const demoEvents: ProductionEvent[] = [
  {
    id: "e1",
    timestamp: "2025-01-15T08:14:00",
    type: "Downtime",
    category: "Machine",
    durationMin: 12,
    comment: "Sensor fault during startup",
  },
  {
    id: "e2",
    timestamp: "2025-01-15T08:47:00",
    type: "Changeover",
    category: "Method",
    durationMin: 18,
    comment: "Tool mismatch / setup not standardized",
  },
  {
    id: "e3",
    timestamp: "2025-01-15T09:30:00",
    type: "Downtime",
    category: "Machine",
    durationMin: 9,
    comment: "Sensor fault repeat",
  },
  {
    id: "e4",
    timestamp: "2025-01-15T10:05:00",
    type: "Scrap",
    category: "Material",
    comment: "Warped input material detected at inspection",
  },
];

export function deriveMetrics(events: ProductionEvent[], shift: ShiftInputs): DerivedMetrics {
  const downtimeMin = events
    .filter((e) => e.type === "Downtime" || e.type === "Changeover")
    .reduce((sum, e) => sum + (e.durationMin ?? 0), 0);

  const runtimeMin = Math.max(shift.plannedTimeMin - downtimeMin, 1);

  const availability = runtimeMin / shift.plannedTimeMin;

  // Simplified performance proxy:
  // (actual output * ideal cycle time) / runtime
  const performance = (shift.outputUnits * shift.idealCycleSec) / (runtimeMin * 60);

  const quality = (shift.outputUnits - shift.scrapUnits) / Math.max(shift.outputUnits, 1);

  return {
    downtimeMin,
    availability,
    performance,
    quality,
    oee: availability * performance * quality,
  };
}

export function runDeterministicFindings(events: ProductionEvent[], metrics: DerivedMetrics): Finding[] {
  const findings: Finding[] = [];

  const machineDowntime = events.filter((e) => e.type === "Downtime" && e.category === "Machine");
  if (machineDowntime.length >= 2) {
    findings.push({
      id: "f1",
      severity: "High",
      description: "Repeated machine downtime detected (likely common cause).",
      evidenceEventIds: machineDowntime.map((e) => e.id),
    });
  }

  const changeovers = events.filter((e) => e.type === "Changeover");
  const changeoverMin = changeovers.reduce((s, e) => s + (e.durationMin ?? 0), 0);
  if (changeoverMin >= 15) {
    findings.push({
      id: "f2",
      severity: "Medium",
      description: "Changeover time appears above target (method / setup standardization opportunity).",
      evidenceEventIds: changeovers.map((e) => e.id),
    });
  }

  if (metrics.oee < 0.65) {
    findings.push({
      id: "f3",
      severity: "High",
      description: "OEE below threshold; prioritize top loss contributors (downtime + changeover + quality losses).",
      evidenceEventIds: events.map((e) => e.id),
    });
  }

  return findings;
}
