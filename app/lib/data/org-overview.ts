import { SupabaseClient } from "@supabase/supabase-js";

export async function getOrgOverviewData(
  supabase: SupabaseClient,
  orgId: string
) {
  // --- 1. Get last 30 days KPIs
  const { data: kpis, error } = await supabase
    .from("kpi_daily")
    .select("day, line_id, oee, scrap_rate")
    .gte("day", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("day", { ascending: true });

  if (error || !kpis) {
    return null;
  }

  // --- 2. Group by day (for chart)
  const daily = new Map<string, { oee: number[]; scrap: number[] }>();

  kpis.forEach((k) => {
    if (!daily.has(k.day)) {
      daily.set(k.day, { oee: [], scrap: [] });
    }
    if (k.oee !== null) daily.get(k.day)!.oee.push(k.oee);
    if (k.scrap_rate !== null) daily.get(k.day)!.scrap.push(k.scrap_rate);
  });

  const trend30d = Array.from(daily.entries()).map(([day, v]) => ({
    day,
    oee: average(v.oee),
    scrap: average(v.scrap),
  }));

  // --- 3. This week aggregation
  const last7 = trend30d.slice(-7);

  const weekOee = average(last7.map((d) => d.oee));
  const weekScrap = average(last7.map((d) => d.scrap));

  // --- 4. Per line aggregation
  const byLine = new Map<
    string,
    { oee: number[]; scrap: number[] }
  >();

  kpis.forEach((k) => {
    if (!byLine.has(k.line_id)) {
      byLine.set(k.line_id, { oee: [], scrap: [] });
    }
    if (k.oee !== null) byLine.get(k.line_id)!.oee.push(k.oee);
    if (k.scrap_rate !== null)
      byLine.get(k.line_id)!.scrap.push(k.scrap_rate);
  });

  const lines = await supabase
    .from("lines")
    .select("id, name")
    .eq("org_id", orgId);

  const linesRanked =
    lines.data?.map((l) => ({
      id: l.id,
      name: l.name,
      oee: average(byLine.get(l.id)?.oee ?? []),
      scrap: average(byLine.get(l.id)?.scrap ?? []),
    })) ?? [];

  // Sort best → worst
  linesRanked.sort((a, b) => {
    if (b.oee !== a.oee) return b.oee - a.oee;
    return a.scrap - b.scrap;
  });

  return {
    weekOee,
    weekScrap,
    trend30d,
    linesRanked,
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
