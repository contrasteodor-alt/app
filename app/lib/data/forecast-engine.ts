type MetricType = "oee" | "scrap";

export async function getLineForecast(
  supabase: any,
  orgId: string,
  lineId: string,
  metric: MetricType
) {
  // 1️⃣ Get latest KPI
  const { data: kpi } = await supabase
    .from("kpi_daily")
    .select("*")
    .eq("line_id", lineId)
    .order("day", { ascending: false })
    .limit(1)
    .single();

  if (!kpi) {
    return {
      current: null,
      target: null,
      gap: null,
      status: "No KPI data",
      forecast_steps: [],
      projected_recovery_date: null,
    };
  }

  const current =
    metric === "oee" ? Number(kpi.oee) : Number(kpi.scrap_rate);

  // 2️⃣ Target
  const { data: targetRows } = await supabase
  .from("line_targets")
  .select("target_value")
  .eq("org_id", orgId)
  .eq("line_id", lineId)
  .eq("metric_type", metric)
  .limit(1);

const targetRow = targetRows?.[0];


  if (!targetRow) {
    return {
      current,
      target: null,
      gap: null,
      status: "No target defined",
      forecast_steps: [],
      projected_recovery_date: null,
    };
  }

  const target = Number(targetRow.target_value);


  
  

  const gap =
    metric === "oee"
      ? target - current
      : current - target;

  if (gap <= 0) {
    return {
      current,
      target,
      gap: 0,
      status: "On track",
      forecast_steps: [],
      projected_recovery_date: null,
    };
  }

  // 3️⃣ Actions
  const { data: actions } = await supabase
  .from("action_plans")
  .select("id, action, owner, due_date, impact_percent")
  .eq("line_id", lineId)
  .eq("org_id", orgId)
  .eq("status", "Open")
  .eq("metric_type", metric)   // 👈 ADD THIS LINE
  .not("impact_percent", "is", null)
  .order("due_date", { ascending: true });

 
  


  if (!actions || actions.length === 0) {
    return {
      current,
      target,
      gap,
      status: "At risk",
      forecast_steps: [],
      projected_recovery_date: null,
    };
  }

  let remainingGap = gap;
  let forecastValue = current;
  const steps: any[] = [];

  for (const action of actions) {
    if (remainingGap <= 0) break;

    const impactPercent = Number(action.impact_percent);
    let contribution = gap * impactPercent;

    if (contribution > remainingGap) {
      contribution = remainingGap;
    }

    forecastValue =
      metric === "oee"
        ? forecastValue + contribution
        : forecastValue - contribution;

    remainingGap -= contribution;

    steps.push({
      action_id: action.id,
      action_title: action.action,
      owner: action.owner,
      due_date: action.due_date,
      impact_percent: impactPercent,
      contribution,
      value_after: forecastValue,
    });
  }

  const reachesTarget = remainingGap <= 0;

  return {
    current,
    target,
    gap,
    status: reachesTarget ? "Recovering" : "At risk",
    forecast_steps: steps,
    projected_recovery_date: reachesTarget
      ? steps[steps.length - 1].due_date
      : null,
  };
}
