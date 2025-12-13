import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getLineById, getOrganizationById } from "@/lib/mock-data";

type LinePageProps = {
  params: Promise<{ id: string; lineId: string }>;
};

export default async function LinePage({ params }: LinePageProps) {
  const { id, lineId } = await params;

  const org = getOrganizationById(id);
  const line = getLineById(lineId); // adjust to your mock-data signature

  if (!org || !line) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {org.name} • <Link href={`/org/${org.id}/overview`}>Overview</Link>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{line.name}</h1>
        <p className="text-muted-foreground">Line status, output and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Current line state</CardDescription>
          </CardHeader>
          <CardContent className="text-lg font-medium capitalize">{line.status ?? "unknown"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output / hr</CardTitle>
            <CardDescription>Last reported throughput</CardDescription>
          </CardHeader>
          <CardContent className="text-lg font-medium">{line.outputPerHour ?? "n/a"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last update</CardTitle>
            <CardDescription>Data freshness</CardDescription>
          </CardHeader>
          <CardContent className="text-lg font-medium">{line.lastUpdate ?? "n/a"}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
          <CardDescription>Navigate into ingest or AI assistance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="default">
            <Link href="/ingest">Ingest data</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/ai">Ask AI</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/improvement/kaizen">Kaizen ideas</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Placeholder for production events and insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Hook this up to Supabase tables for events, downtime and metrics.</p>
          <Separator />
          <p>• Use Supabase Realtime or cron ingests to populate these entries.</p>
        </CardContent>
      </Card>
    </div>
  );
}
