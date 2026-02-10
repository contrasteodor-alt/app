export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActionPlansByType } from "@/lib/data/action-plans";
import { ActionTable } from "@/components/actions/action-table";

export default async function ScrapActionPlanPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = createSupabaseServerClient();

  const actions = await getActionPlansByType(
    supabase,
    params.orgId,
    "scrap"
  );

  const { data: lines } = await supabase
  .from("lines")
  .select("id, name, line_code")
  .eq("org_id", params.orgId);

const lineMap = new Map(
  lines?.map((l) => [
    l.id,
    `${l.name}${l.line_code ? ` (${l.line_code})` : ""}`,
  ])
);


  return (
    <div className="space-y-6">
      {/* SWITCH */}
      <div className="flex gap-6 border-b pb-3">
        <a href={`/${params.orgId}/action-plan/oee`} className="text-sm">
          OEE
        </a>
        <a
          href={`/${params.orgId}/action-plan/scrap`}
          className="text-sm font-medium"
        >
          Scrap
        </a>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">
        Scrap Action Plan
      </h1>

      <ActionTable actions={actions} lineMap={lineMap} />
    </div>
  );
}
