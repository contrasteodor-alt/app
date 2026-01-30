export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getOrganization } from "@/lib/data/organizations";
import { getLinesForOrg } from "@/lib/data/lines";
import { getLatestKpisForOrg } from "@/lib/data/kpis";

const { createSupabaseServerClient } = await import(
  "@/lib/supabase/server"
);

type OrgOverviewPageProps = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgOverviewPage({
  params,
}: OrgOverviewPageProps) {
  const { orgId } = await params;

  const supabase = await createSupabaseServerClient();

  const org = await getOrganization(orgId);
  if (!org) {
    notFound();
  }

  const lines = await getLinesForOrg(supabase, orgId);
  const kpis = await getLatestKpisForOrg(supabase, orgId);

  // merge lines with latest KPIs
  const linesWithKpis = lines.map((line) => {
    const kpi = kpis.find((k) => k.line_id === line.id);

    return {
      id: line.id,
      name: line.name,
      oee: kpi?.oee ?? null,
      scrap_rate: kpi?.scrap_rate ?? null,
    };
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {org.name}
        </h1>
        <p className="text-muted-foreground">
          Production lines overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {linesWithKpis.map((line) => (
          <Card key={line.id}>
            <CardHeader>
              <CardTitle>{line.name}</CardTitle>
              <CardDescription>
                OEE:{" "}
                {line.oee !== null
                  ? `${(line.oee * 100).toFixed(1)}%`
                  : "n/a"}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Scrap:{" "}
                {line.scrap_rate !== null
                  ? `${(line.scrap_rate * 100).toFixed(2)}%`
                  : "n/a"}
              </div>

              <Button asChild variant="secondary">
                <Link href={`/${orgId}/lines/${line.id}`}>
                  View line
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
