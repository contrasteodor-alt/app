import { SupabaseClient } from "@supabase/supabase-js";

export type AIShiftSuggestion = {
  suggestionId: string;
  clusterId: string;

  plantId: string;
  plantName: string;

  areaId: string;
  areaName: string;

  lineId: string;
  lineName: string;
  lineCode: string;

  eventType: string;
  failureModeKey: string;

  eventCount: number;
  totalImpact: number;

  windowStart: string;
  windowEnd: string;

  suggestedActionType: string;
  status: string;
};

export async function getAIShiftAnalysisData(
  supabase: SupabaseClient,
  orgId: string,
  plantId: string
): Promise<AIShiftSuggestion[]> {
 /* -------------------------------------------------
   1. Load AI EVENT CLUSTERS (context owner)
------------------------------------------------- */
const { data: clusters, error } = await supabase
.from("ai_event_clusters")
.select(`
  id,
  org_id,
  plant_id,
  area_id,
  line_id,
  event_type,
  failure_mode_key,
  event_count,
  total_impact,
  window_start,
  window_end
`)
.eq("org_id", orgId)
.eq("plant_id", plantId);

if (error) {
console.error("AI EVENT CLUSTERS LOAD ERROR:", error);
throw new Error("Failed to load AI event clusters");
}

//console.log("AI SHIFT CLUSTERS:", clusters?.length ?? 0);
//console.log("AI SHIFT orgId:", orgId);
//console.log("AI SHIFT plantId:", plantId);


if (!clusters || clusters.length === 0) {
return [];
}


  /* -------------------------------------------------
     2. Load MASTER DATA (no joins, no RLS cascade)
  ------------------------------------------------- */
  const { data: lines } = await supabase
    .from("lines")
    .select("id, name, line_code, area_id");

  const { data: areas } = await supabase
    .from("areas")
    .select("id, name, plant_id");

  const { data: plants } = await supabase
    .from("plants")
    .select("id, name");

  const lineById = new Map(lines?.map(l => [l.id, l]));
  const areaById = new Map(areas?.map(a => [a.id, a]));
  const plantById = new Map(plants?.map(p => [p.id, p]));

  /* -------------------------------------------------
     3. Load AI ACTION SUGGESTIONS (pending only)
  ------------------------------------------------- */
  const clusterIds = clusters.map(c => c.id);

  const { data: suggestions } = await supabase
    .from("ai_action_suggestions")
    .select("id, cluster_id, status, suggested_action_type")
    .in("cluster_id", clusterIds)
    .eq("status", "pending");

  const suggestionsByCluster = new Map<string, typeof suggestions>();

  for (const s of suggestions ?? []) {
    if (!suggestionsByCluster.has(s.cluster_id)) {
      suggestionsByCluster.set(s.cluster_id, []);
    }
    suggestionsByCluster.get(s.cluster_id)!.push(s);
  }

  /* -------------------------------------------------
     4. Compose FINAL ROWS
  ------------------------------------------------- */
  const rows: AIShiftSuggestion[] = [];

  for (const c of clusters) {
    const line = lineById.get(c.line_id);
    if (!line) continue;

    const area = areaById.get(c.area_id);
    if (!area) continue;

    const plant = plantById.get(c.plant_id);
    if (!plant) continue;

    const clusterSuggestions = suggestionsByCluster.get(c.id) ?? [];
    if (clusterSuggestions.length === 0) continue;

    for (const s of clusterSuggestions) {
      rows.push({
        suggestionId: s.id,
        clusterId: c.id,

        plantId: plant.id,
        plantName: plant.name,

        areaId: area.id,
        areaName: area.name,

        lineId: line.id,
        lineName: line.name,
        lineCode: line.line_code,

        eventType: c.event_type,
        failureModeKey: c.failure_mode_key,

        eventCount: c.event_count,
        totalImpact: c.total_impact,

        windowStart: c.window_start,
        windowEnd: c.window_end,

        suggestedActionType: s.suggested_action_type,
        status: s.status,
      });
    }
  }

  return rows;
}
