import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLinesForOrg, getOrganizations } from '@/lib/mock-data';

export default function SelectOrgPage() {
	const orgs = getOrganizations();

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-semibold tracking-tight">Choose an organization</h1>
				<p className="text-muted-foreground">
					Pick an org to view its overview, lines, AI insights, or ingest data.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				{orgs.map((org) => {
					const lines = getLinesForOrg(org.id);
					return (
						<Card key={org.id}>
							<CardHeader>
								<CardTitle>{org.name}</CardTitle>
								<CardDescription>{org.description}</CardDescription>
							</CardHeader>
							<CardContent className="flex items-center justify-between">
								<div className="text-sm text-muted-foreground">
									<div>{org.location}</div>
									<div className="mt-1">{lines.length} lines</div>
								</div>
								<Button asChild>
									<Link href={`/org/${org.id}/overview`}>Open</Link>
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

