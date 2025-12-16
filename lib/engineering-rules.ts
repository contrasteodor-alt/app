import { ProductionEvent, EngineeringFinding } from "./domain";

export function detectLossPatterns(events: ProductionEvent[]): EngineeringFinding[] {
  const machineDowntime = events.filter(
    e => e.type === "Downtime" && e.category === "Machine"
  );

  if (machineDowntime.length >= 2) {
    return [
      {
        id: "f1",
        description: "Repeated machine-related downtime detected",
        severity: "High",
        evidenceEventIds: machineDowntime.map(e => e.id),
      },
    ];
  }

  return [];
}
