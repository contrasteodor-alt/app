import { ProductionEvent } from "./domain";

export const mockEvents: ProductionEvent[] = [
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
    comment: "Tool mismatch",
  },
  {
    id: "e3",
    timestamp: "2025-01-15T09:30:00",
    type: "Scrap",
    category: "Material",
    comment: "Warped input material",
  },
];
