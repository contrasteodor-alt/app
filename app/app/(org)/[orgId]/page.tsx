export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganization } from "@/lib/data/organizations";
import { getOrgOverviewData } from "@/lib/data/org-overview";

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
    <div className="space-y-8">

      {/* TOP COMMAND PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          <h1 className="text-3xl font-semibold">{org.name}</h1>
          <p className="text-muted-foreground">This week</p>

          <div className="mt-4">
            <div className="text-5xl font-bold">
              {(data.weekOee * 100).toFixed(1)}%
            </div>
            <div className="text-muted-foreground">Overall OEE</div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-medium">
              {(data.weekScrap * 100).toFixed(2)}%
            </div>
            <div className="text-muted-foreground">Overall Scrap</div>
          </div>
        </div>

        {/* TREND (placeholder for chart lib) */}
        <div className="col-span-2 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Last 30 days evolution
          </p>

          {/* Chart will go here */}
          <pre className="text-xs bg-muted/30 p-2 rounded">
            {JSON.stringify(data.trend30d.slice(-5), null, 2)}
          </pre>
        </div>
      </div>

      {/* LINES TABLE */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Production lines (best → worst)
        </h2>

        <div className="border rounded-lg divide-y">
          {data.linesRanked.map((l) => (
            <div
              key={l.id}
              className="flex justify-between items-center px-4 py-3 hover:bg-muted/30"
            >
              <div className="font-medium">{l.name}</div>

              <div className="flex gap-6 text-sm">
                <div>
                  OEE: {(l.oee * 100).toFixed(1)}%
                </div>
                <div>
                  Scrap: {(l.scrap * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
