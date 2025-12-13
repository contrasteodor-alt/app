// lib/mock-data.ts

export type Organization = {
  id: string;
  name: string;
};

export type Line = {
  id: string;
  orgId: string;
  name: string;
  status?: string;
  outputPerHour?: number;
  lastUpdate?: string;
};

// --------------------
// Mock data
// --------------------

export const organizations: Organization[] = [
  { id: "org-1", name: "Demo Factory" },
];

export const lines: Line[] = [
  {
    id: "line-1",
    orgId: "org-1",
    name: "Assembly Line 1",
    status: "running",
    outputPerHour: 120,
    lastUpdate: "10 min ago",
  },
  {
    id: "line-2",
    orgId: "org-1",
    name: "Assembly Line 2",
    status: "stopped",
    outputPerHour: 0,
    lastUpdate: "1 hour ago",
  },
];

// --------------------
// Selectors
// --------------------

export function getOrganizationById(id: string) {
  return organizations.find((o) => o.id === id);
}

export function getLinesForOrg(orgId: string) {
  return lines.filter((l) => l.orgId === orgId);
}

export function getLineById(lineId: string) {
  return lines.find((l) => l.id === lineId);
}
