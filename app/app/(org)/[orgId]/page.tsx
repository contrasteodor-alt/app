export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganization } from "@/lib/data/organizations";
import { getOrgOverviewData } from "@/lib/data/org-overview";
import { OrgEvolutionChart } from "@/components/org/org-evolution-chart";
import { oeeColor, scrapColor } from "@/components/ui/kpi-colors";

export default async function OrgHome({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = createSupabaseServerClient();

  const org = await getOrganization(params.orgId);
  if (!org) notFound();

  const data = await getOrgOverviewData(supabase, params.orgId);
  if (!data) notFound();

  return (
    <div className="flex flex-col gap-12">

      {/* TOP COMMAND PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* LEFT: KPIs */}
        <div className="col-span-1 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {org.name}
            </h1>
            <p className="text-muted-foreground">
              This week
            </p>
          </div>

          <div>
            <div
              className={`text-6xl font-semibold tracking-tight ${oeeColor(
                data.weekOee
              )}`}
            >
              {(data.weekOee * 100).toFixed(1)}%
            </div>
            <div className="text-muted-foreground">
              Overall OEE
            </div>
          </div>

          <div>
            <div
              className={`text-2xl font-normal ${scrapColor(
                data.weekScrap
              )}`}
            >
              {(data.weekScrap * 100).toFixed(2)}%
            </div>
            <div className="text-muted-foreground">
              Overall Scrap
            </div>
          </div>
        </div>

        {/* RIGHT: EVOLUTION */}
        <div className="col-span-2 rounded-xl border bg-background/50 p-6">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Last 30 days evolution
          </p>

          <OrgEvolutionChart data={data.trend30d} />
        </div>
      </div>

      {/* LINES RANKING */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-6">
          Production lines (best → worst)
        </h2>

        <div className="border rounded-xl divide-y overflow-hidden">
          {data.linesRanked.map((l) => (
            <div
              key={l.id}
              className="flex justify-between items-center px-6 py-4 hover:bg-muted/40 transition"
            >
              <div className="flex items-center gap-2 font-medium">
  {l.name}
  {l.openActions > 0 && (
    <span
      title={`${l.openActions} open actions`}
      className="inline-block h-2 w-2 rounded-full bg-red-500"
    />
  )}
</div>


              <div className="flex gap-8 text-sm font-medium">
                <div className={oeeColor(l.oee)}>
                  {(l.oee * 100).toFixed(1)}%
                </div>
                <div className={scrapColor(l.scrap)}>
                  {(l.scrap * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
