import { Organization, ProductionLine } from '@/types';

export const mockOrganizations: Organization[] = [
	{
		id: 'org-1',
		name: 'Aurora Manufacturing',
		description: 'Precision components and assemblies',
		location: 'Cleveland, OH'
	},
	{
		id: 'org-2',
		name: 'Northwind Plastics',
		description: 'High-volume extrusion and molding',
		location: 'Milwaukee, WI'
	},
	{
		id: 'org-3',
		name: 'Summit Food Co.',
		description: 'Prepared foods and packaging',
		location: 'Chicago, IL'
	}
];

export const mockLines: ProductionLine[] = [
	{
		id: 'line-1',
		orgId: 'org-1',
		name: 'CNC Line A',
		status: 'running',
		outputPerHour: 120,
		lastUpdate: '10 min ago'
	},
	{
		id: 'line-2',
		orgId: 'org-1',
		name: 'Assembly Line B',
		status: 'idle',
		outputPerHour: 85,
		lastUpdate: '5 min ago'
	},
	{
		id: 'line-3',
		orgId: 'org-2',
		name: 'Extrusion 01',
		status: 'running',
		outputPerHour: 200,
		lastUpdate: '2 min ago'
	},
	{
		id: 'line-4',
		orgId: 'org-3',
		name: 'Packaging Prep',
		status: 'maintenance',
		outputPerHour: 65,
		lastUpdate: '1 hour ago'
	}
];

export function getOrganizations(): Organization[] {
	return mockOrganizations;
}

export function getOrganizationById(id: string): Organization | undefined {
	return mockOrganizations.find((org) => org.id === id);
}

export function getLinesForOrg(orgId: string): ProductionLine[] {
	return mockLines.filter((line) => line.orgId === orgId);
}

export function getLineById(lineId: string): ProductionLine | undefined {
	return mockLines.find((line) => line.id === lineId);
}

