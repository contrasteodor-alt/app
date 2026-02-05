import { SupabaseClient } from "@supabase/supabase-js";

export async function getOrgOverviewData(
  supabase: SupabaseClient,
  orgId: string,
  plantId: string,
  dateFrom: string,
  dateTo: string
) {
  // 1. Areas of the plant
  const { data: areas, error: areaError } = await supabase
    .from("areas")
    .select("id, name")
    .eq("plant_id", plantId)
    .order("name");

  if (areaError || !areas) return null;

  const areaIds = areas.map((a) => a.id);

  // 2. Area summary KPIs (30d)
  const { data: areaSummary } = await supabase
    .from("kpi_area_30d")
    .select("area_id, avg_oee_30d, avg_scrap_rate_30d")
    .in("area_id", areaIds);

  const summaryByArea = new Map(
    areaSummary?.map((a) => [a.area_id, a]) ?? []
  );

  // 3. Area trend data
  const { data: areaDaily } = await supabase
    .from("kpi_area_daily")
    .select("day, area_id, oee, scrap_rate")
    .in("area_id", areaIds)
    .gte("day", dateFrom)
    .lte("day", dateTo)
    .order("day", { ascending: true });

  const trendByArea = new Map<
    string,
    { day: string; oee: number; scrap: number }[]
  >();

  areaDaily?.forEach((d) => {
    if (!trendByArea.has(d.area_id)) {
      trendByArea.set(d.area_id, []);
    }
    trendByArea.get(d.area_id)!.push({
      day: d.day,
      oee: d.oee ?? 0,
      scrap: d.scrap_rate ?? 0,
    });
  });

  // 4. Line ranking KPIs per area
  const { data: lineRanks } = await supabase
    .from("kpi_area_line_30d")
    .select("area_id, line_id, avg_oee_30d, avg_scrap_rate_30d")
    .in("area_id", areaIds);

  if (!lineRanks) return null;

  // 5. Fetch line master data explicitly (names, codes)
  const rankedLineIds = [...new Set(lineRanks.map((l) => l.line_id))];

  const { data: lines } = await supabase
    .from("lines")
    .select("id, name, line_code")
    .in("id", rankedLineIds);

  const linesById = new Map(
    lines?.map((l) => [l.id, l]) ?? []
  );

  // 6. Open action plans per line
  const actionLineIds = rankedLineIds;

  const { data: actions } = await supabase
    .from("action_plans")
    .select("line_id")
    .eq("status", "Open")
    .in("line_id", actionLineIds);

  const actionsByLine = new Map<string, number>();
  actions?.forEach((a) => {
    actionsByLine.set(
      a.line_id,
      (actionsByLine.get(a.line_id) ?? 0) + 1
    );
  });

  // 7. Assemble final structure
  const areasFinal = areas.map((area) => {
    const linesForArea =
      lineRanks
        .filter((l) => l.area_id === area.id)
        .map((l) => {
          const line = linesById.get(l.line_id);

          return {
            id: l.line_id,
            name: line?.name ?? "",
            lineCode: line?.line_code ?? "",
            oee: l.avg_oee_30d ?? 0,
            scrap: l.avg_scrap_rate_30d ?? 0,
            openActions: actionsByLine.get(l.line_id) ?? 0,
          };
        })
        .sort((a, b) => b.oee - a.oee);

    return {
      id: area.id,
      name: area.name,
      summary: {
        oee: summaryByArea.get(area.id)?.avg_oee_30d ?? 0,
        scrap: summaryByArea.get(area.id)?.avg_scrap_rate_30d ?? 0,
      },
      trend: trendByArea.get(area.id) ?? [],
      lines: linesForArea,
    };
  });

  return {
    plantId,
    areas: areasFinal,
  };
}
