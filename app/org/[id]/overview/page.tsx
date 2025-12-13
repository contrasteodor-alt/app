import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrganizationById, getLinesForOrg } from "@/lib/mock-data";

type OrgOverviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrgOverviewPage({ params }: OrgOverviewPageProps) {
  const { id } = await params;

  const org = getOrganizationById(id);
  const lines = getLinesForOrg(id);

  if (!org) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{org.name}</h1>
        <p className="text-muted-foreground">Production lines overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {lines.map((line) => (
          <Card key={line.id}>
            <CardHeader>
              <CardTitle>{line.name}</CardTitle>
              <CardDescription>Status: {line.status ?? "unknown"}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Output/hr: {line.outputPerHour ?? "n/a"}
              </div>
              <Button asChild variant="secondary">
                <Link href={`/org/${id}/lines/${line.id}`}>View line</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
