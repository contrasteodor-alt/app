export type Organization = {
	id: string;
	name: string;
	description?: string;
	location?: string;
};

export type ProductionLine = {
	id: string;
	orgId: string;
	name: string;
	status?: 'running' | 'idle' | 'maintenance';
	outputPerHour?: number;
	lastUpdate?: string;
};

