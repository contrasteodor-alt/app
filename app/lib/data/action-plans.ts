import { SupabaseClient } from "@supabase/supabase-js";

export async function getActionPlansByType(
  supabase: SupabaseClient,
  orgId: string,
  type: "oee" | "scrap"
) {
  const prefix = type === "scrap" ? "scrap%" : "downtime%";

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
    line_id,
    failure_mode_key
  `)
  .eq("org_id", orgId)
  .eq("source", "ai")
  .ilike("failure_mode_key", prefix)
  .order("created_at", { ascending: false });


  if (error) throw error;

  return data ?? [];
}