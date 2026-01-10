'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockOrganizations } from '@/lib/mock-data';

type OrgSwitcherProps = {
	currentOrgId?: string;
};

export function OrgSwitcher({ currentOrgId }: OrgSwitcherProps) {
	const router = useRouter();
	const pathname = usePathname();

	const orgOptions = useMemo(() => mockOrganizations, []);
 

	const handleChange = (value: string) => {
	if (!value) return;

	// 1️⃣ Save global Lean context
	localStorage.setItem(
		'lean-context',
		JSON.stringify({
			orgId: value
		})
	);

	// 2️⃣ Navigate as before
	const isOrgScoped = pathname?.includes('/org/');
	const target = isOrgScoped
		? `/org/${value}/overview`
		: `/org/${value}/overview`;

	router.push(target);
};


	return (
		<div className="min-w-[220px]">
			<Select onValueChange={handleChange} defaultValue={currentOrgId ?? orgOptions[0]?.id}>
				<SelectTrigger aria-label="Select organization" className="w-full">
					<SelectValue placeholder="Select organization" />
				</SelectTrigger>
				<SelectContent>
					{orgOptions.map((org) => (
						<SelectItem key={org.id} value={org.id}>
							<div className="flex flex-col">
								<span className="font-medium">{org.name}</span>
								<span className="text-xs text-muted-foreground">{org.location}</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

