export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AreaTrendChart } from "@/components/area-trend-chart";

import { getOrganization } from "@/lib/data/organizations";
import { getOrgOverviewData } from "@/lib/data/org-overview";
import { getPlantsForOrg } from "@/lib/data/organizations";

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
  if (!org) notFound();

  // --- Plant (single plant for now)
  const plants = await getPlantsForOrg(supabase, orgId);
  const plant = plants?.[0];
  if (!plant) notFound();

  // --- Date range (last 30 days)
  const dateTo = new Date().toISOString().slice(0, 10);
  const dateFrom = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10);

  const overview = await getOrgOverviewData(
    supabase,
    orgId,
    plant.id,
    dateFrom,
    dateTo
  );

  if (!overview) notFound();

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {org.name}
        </h1>
        <p className="text-muted-foreground">
          Plant overview — {plant.name}
        </p>
      </div>

      {/* Areas */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {overview.areas.map((area) => (
          <Card key={area.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{area.name}</span>
                <span className="text-sm text-muted-foreground">
                  OEE {(area.summary.oee * 100).toFixed(1)}% · Scrap{" "}
                  {(area.summary.scrap * 100).toFixed(2)}%
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Area trend graph */}
              <div className="text-xs text-muted-foreground">
  Last 30 days
</div>
              <AreaTrendChart data={area.trend} />

              {/* Lines ranking */}
              <div className="space-y-2">
              {area.lines.map((line, idx) => {
                const isWorst = idx === area.lines.length - 1;

                return (
                 <div
                  key={line.id}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                       isWorst ? "bg-red-50 border-red-200" : ""
                      }`}
                         >

                    <div className="font-semibold text-sm text-foreground">
                    {line.name || line.lineCode || "Unnamed line"}
                      </div>

                    <div className="flex gap-4 text-muted-foreground">
                      <span>
                        OEE {(line.oee * 100).toFixed(1)}%
                      </span>
                      <span>
                        Scrap {(line.scrap * 100).toFixed(2)}%
                      </span>
                      <span
  className={`px-2 py-0.5 rounded text-xs font-medium ${
    line.openActions === 0
      ? "bg-green-100 text-green-700"
      : line.openActions < 3
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-700"
  }`}
>
  Actions {line.openActions}
</span>

                    </div>
                  </div>
                );
              })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
