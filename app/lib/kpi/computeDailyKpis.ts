import { createSupabaseServerClient } from "@/lib/supabase/server";

type AffectedKey = {
  day: string;      // YYYY-MM-DD
  line_id: string; // uuid
};

export async function computeDailyKpis(affected: AffectedKey[]) {
  if (affected.length === 0) return;

  const supabase = createSupabaseServerClient();

  for (const { day, line_id } of affected) {
    // 1. Load production
    const { data: prod } = await supabase
      .from("output_readings")
      .select("good_qty, total_qty, ideal_cycle_sec")
      .eq("line_id", line_id)
      .gte("ts", `${day}T00:00:00`)
      .lt("ts", `${day}T23:59:59`)
      .single();

    if (!prod) continue;

    // 2. Load downtime
    const { data: downtime } = await supabase
      .from("events")
      .select("duration_min")
      .eq("line_id", line_id)
      .eq("event_type", "downtime")
      .gte("occurred_at", `${day}T00:00:00`)
      .lt("occurred_at", `${day}T23:59:59`);

    const downtimeMin =
      downtime?.reduce((s, d) => s + (d.duration_min || 0), 0) || 0;

    // 3. Load scrap
    const { data: scrap } = await supabase
      .from("scrap_events")
      .select("scrap_qty")
      .eq("line_id", line_id)
      .gte("ts", `${day}T00:00:00`)
      .lt("ts", `${day}T23:59:59`);

    const scrapQty =
      scrap?.reduce((s, r) => s + (r.scrap_qty || 0), 0) || 0;

    // 4. Planned time from shift
    const { data: shift } = await supabase
      .from("shifts")
      .select("planned_time_min")
      .eq("org_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .limit(1)
      .single();

    const plannedMin = shift?.planned_time_min || 0;
    const operatingMin = Math.max(plannedMin - downtimeMin, 0);

    // 5. KPI formulas
    const availability =
      plannedMin > 0 ? operatingMin / plannedMin : 0;

    const performance =
      operatingMin > 0 && prod.ideal_cycle_sec
        ? (prod.good_qty * prod.ideal_cycle_sec) / (operatingMin * 60)
        : 0;

    const quality =
      prod.total_qty > 0 ? prod.good_qty / prod.total_qty : 0;

    const oee = availability * performance * quality;

    const scrap_rate =
      prod.total_qty > 0 ? scrapQty / prod.total_qty : 0;

    // 6. Upsert KPI
    await supabase.from("kpi_daily").upsert(
      {
        day,
        line_id,
        availability,
        performance,
        quality,
        oee,
        scrap_rate,
      },
      {
        onConflict: "day,line_id",
      }
    );
  }
}
