import { SupabaseClient } from "@supabase/supabase-js";

export async function getActionPlansByType(
  supabase: SupabaseClient,
  orgId: string,
  type: "oee" | "scrap"
) {
  const keyword = type === "oee" ? "oee" : "scrap";

  const { data, error } = await supabase
    .from("action_plans")
    .select(`
      id,
      action,
      root_cause,
      owner,
      due_date,
      status,
      source,
      expected_impact,
      line_id
    `)
    .eq("org_id", orgId)
    .or(
      `source.eq.${type},source.eq.ai,expected_impact.ilike.%${keyword}%`
    )
    
    .order("due_date", { ascending: true });

  if (error) throw error;

  return data ?? [];
}
