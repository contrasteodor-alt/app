import { SupabaseClient } from "@supabase/supabase-js";

export async function getLatestKpisForOrg(
  supabase: SupabaseClient,
  orgId: string
) {
  // get latest day first
  const { data: latestDayRow } = await supabase
    .from("kpi_daily")
    .select("day")
    .order("day", { ascending: false })
    .limit(1)
    .single();

  if (!latestDayRow?.day) return [];

  const { data, error } = await supabase
    .from("kpi_daily")
    .select("line_id, oee, scrap_rate")
    .eq("day", latestDayRow.day);

  if (error || !data) return [];

  return data;
}
