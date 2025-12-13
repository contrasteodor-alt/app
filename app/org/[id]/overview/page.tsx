import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { getLinesForOrg, getOrganizationById } from '@/lib/mock-data';

type OrgOverviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrgOverviewPage({ params }: OrgOverviewPageProps) {
  const { id } = await params;

  const org = getOrganizationById(id);
  const lines = getLinesForOrg(id);

  if (!org) return notFound();

  // ...return JSX



	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<p className="text-sm text-muted-foreground">Organization overview</p>
				<h1 className="text-3xl font-semibold tracking-tight">{org.name}</h1>
				<p className="text-muted-foreground">{org.description}</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Location</CardTitle>
						<CardDescription>Primary site for this org</CardDescription>
					</CardHeader>
					<CardContent className="text-lg font-medium">{org.location}</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Active lines</CardTitle>
						<CardDescription>Total tracked production lines</CardDescription>
					</CardHeader>
					<CardContent className="text-lg font-medium">{lines.length}</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Next actions</CardTitle>
						<CardDescription>Route into this org workspace</CardDescription>
					</CardHeader>
					<CardContent className="flex gap-2">
						<Button asChild variant="default">
							<Link href={`/org/${org.id}/lines/${lines[0]?.id ?? 'line-1'}`}>View a line</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/ingest">Ingest data</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Lines</CardTitle>
					<CardDescription>Navigate to each line for details.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{lines.map((line) => (
						<div key={line.id} className="rounded-lg border bg-card p-4">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div>
									<p className="text-base font-semibold">{line.name}</p>
									<p className="text-sm text-muted-foreground">
										Status: {line.status ?? 'unknown'} • Output/hr: {line.outputPerHour ?? 0}
									</p>
								</div>
								<Button asChild size="sm" variant="secondary">
									<Link href={`/org/${org.id}/lines/${line.id}`}>Open</Link>
								</Button>
							</div>
							<Separator className="my-3" />
							<p className="text-xs text-muted-foreground">Last update: {line.lastUpdate ?? 'n/a'}</p>
						</div>
					))}
					{lines.length === 0 && (
						<p className="text-sm text-muted-foreground">No lines defined yet for this org.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

