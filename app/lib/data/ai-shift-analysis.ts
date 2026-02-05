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
  const { data, error } = await supabase
    .from("ai_action_suggestions")
    .select(`
      id,
      status,
      suggested_action_type,
      ai_event_clusters!ai_action_suggestions_cluster_fk (
        id,
        event_type,
        failure_mode_key,
        event_count,
        total_impact,
        window_start,
        window_end,
        plant_id,
        area_id,
        line_id,
        lines (
          id,
          name,
          line_code,
          areas (
            id,
            name,
            plants (
              id,
              name,
              org_id
            )
          )
        )
      )
    `)
    .eq("status", "pending");
    if (error) {
      console.error("AI SHIFT ANALYSIS ERROR:", error);
    }
    
  if (error || !data) {
    throw new Error("Failed to load AI shift analysis data");
  }

  const rows: AIShiftSuggestion[] = [];

  for (const s of data) {
    const clusters = s.ai_event_clusters;

if (!Array.isArray(clusters) || clusters.length === 0) {
  continue; // no resolvable cluster
}

const c = clusters[0];


    const lines = c.lines;
    if (!Array.isArray(lines) || lines.length === 0) {
   continue; // orphan cluster, skip
   }

    const line = lines[0];


    const areas = line.areas;
    if (!areas || areas.length === 0) continue;

    const area = areas[0];

    const plants = area.plants;
    if (!plants || plants.length === 0) continue;

    const plant = plants[0];

    if (plant.org_id !== orgId) continue;
    if (plant.id !== plantId) continue;

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

  return rows;
}
