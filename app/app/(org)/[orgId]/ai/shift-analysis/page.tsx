export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getOrganization } from "@/lib/data/organizations";
import { getAIShiftAnalysisData } from "@/lib/data/ai-shift-analysis";
import { AiShiftRow } from "@/components/ai/ai-shift-row";


type PageProps = {
  params: { orgId: string };
  searchParams?: { plantId?: string };
};

export default async function AIShiftAnalysisPage({
  params,
  searchParams,
}: PageProps) {
  const { orgId } = params;

  const supabase = await createSupabaseServerClient();

  const org = await getOrganization(orgId);
  if (!org) notFound();

  // Load plants from DB
  const { data: plants } = await supabase
    .from("plants")
    .select("id, name")
    .eq("org_id", orgId)
    .order("name");

  if (!plants || plants.length === 0) {
    return <div>No plants defined.</div>;
  }

  const selectedPlantId =
    searchParams?.plantId ?? plants[0].id;

  const suggestions = await getAIShiftAnalysisData(
    supabase,
    orgId,
    selectedPlantId
  );

  // Group by Area
  const byArea = new Map<string, typeof suggestions>();

  for (const s of suggestions) {
    if (!byArea.has(s.areaId)) {
      byArea.set(s.areaId, []);
    }
    byArea.get(s.areaId)!.push(s);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            AI Shift Analysis
          </h1>
          <p className="text-muted-foreground">
            {org.name}
          </p>
        </div>

        {/* Plant selector */}
        <form>
          <Select name="plantId" defaultValue={selectedPlantId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select plant" />
            </SelectTrigger>
            <SelectContent>
              {plants.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>
      </div>

      {/* Content */}
{byArea.size === 0 ? (
  <div className="text-muted-foreground">
    No pending AI suggestions for this plant.
  </div>
) : (
  <div className="space-y-10">
    {Array.from(byArea.entries()).map(([areaId, items]) => (
      <Card key={areaId}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{items[0].areaName}</span>
            <Badge variant="secondary">
              {items.length} suggestion{items.length > 1 ? "s" : ""}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
        {items.map((s) => (
  <AiShiftRow
    key={s.suggestionId}
    orgId={params.orgId}
    suggestionId={s.suggestionId}
    lineLabel={`${s.lineName} (${s.lineCode})`}
    eventType={s.eventType}
    failureMode={s.failureModeKey.replaceAll("|", " / ")}
    eventCount={s.eventCount}
    impact={s.totalImpact}
    suggestedActionType={s.suggestedActionType}
  />
))}

        </CardContent>
      </Card>
    ))}
  </div>
)}

    </div>
  );
}
