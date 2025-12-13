// lib/mock-data.ts

export type Organization = {
  id: string;
  name: string;
  description?: string;
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

// Keep the canonical export name:
export const organizations: Organization[] = [
  { id: "org-1", name: "Demo Factory" },
];

// Some parts of the app expect `mockOrganizations`.
// Provide an alias so you don't have to refactor components.
export const mockOrganizations = organizations;

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

export const organizations: Organization[] = [
  { id: "org-1", name: "Demo Factory", description: "Lean KPI demo workspace" },
];


// --------------------
// Selectors / helpers
// --------------------

export function getOrganizations() {
  return organizations;
}

export function getOrganizationById(id: string) {
  return organizations.find((o) => o.id === id);
}

export function getLinesForOrg(orgId: string) {
  return lines.filter((l) => l.orgId === orgId);
}

export function getLineById(lineId: string) {
  return lines.find((l) => l.id === lineId);
}
