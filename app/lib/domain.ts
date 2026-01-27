// lib/domain.ts

export type LossCategory = "Machine" | "Method" | "Material" | "Man" | "Other";

export type ProductionEvent = {
  id: string;
  timestamp: string;
  type: "Downtime" | "Changeover" | "Scrap";
  category: LossCategory;
  durationMin?: number;
  comment?: string;
};

export type ShiftMetrics = {
  plannedTimeMin: number;
  downtimeMin: number;
  outputUnits: number;
  scrapUnits: number;
  idealCycleSec: number;
};

export type DerivedMetrics = {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
};

export type EngineeringFinding = {
  id: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  evidenceEventIds: string[];
};

export type RecommendedAction = {
  action: string;
  category: LossCategory;
  expectedImpact: string;
  confidence: "Low" | "Medium" | "High";
};
