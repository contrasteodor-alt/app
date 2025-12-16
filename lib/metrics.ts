import { ProductionEvent, ShiftMetrics, DerivedMetrics } from "./domain";

export function deriveShiftMetrics(events: ProductionEvent[]): ShiftMetrics {
  const plannedTimeMin = 480;

  const downtimeMin = events
    .filter(e => e.type === "Downtime" || e.type === "Changeover")
    .reduce((sum, e) => sum + (e.durationMin ?? 0), 0);

  return {
    plannedTimeMin,
    downtimeMin,
    outputUnits: 420,
    scrapUnits: 18,
    idealCycleSec: 12,
  };
}

export function calculateOEE(m: ShiftMetrics): DerivedMetrics {
  const availability = (m.plannedTimeMin - m.downtimeMin) / m.plannedTimeMin;
  const performance = (m.outputUnits * m.idealCycleSec) / ((m.plannedTimeMin - m.downtimeMin) * 60);
  const quality = (m.outputUnits - m.scrapUnits) / m.outputUnits;

  return {
    availability,
    performance,
    quality,
    oee: availability * performance * quality,
  };
}
