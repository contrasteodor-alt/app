import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { suggestionId, decision } = await req.json();

  if (!suggestionId || !["accept", "reject"].includes(decision)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Load suggestion + cluster
  const { data: suggestion, error } = await supabase
    .from("ai_action_suggestions")
    .select(`
      id,
      status,
      ai_event_clusters (
        id,
        org_id,
        plant_id,
        area_id,
        line_id,
        event_type,
        failure_mode_key,
        total_impact
      )
    `)
    .eq("id", suggestionId)
    .single();

  if (error || !suggestion || !suggestion.ai_event_clusters) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }

  const clusters = suggestion.ai_event_clusters;

if (!Array.isArray(clusters) || clusters.length === 0) {
  return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
}

const cluster = clusters[0];


  // REJECT
  if (decision === "reject") {
    await supabase
      .from("ai_action_suggestions")
      .update({
        status: "rejected",
        decided_at: new Date().toISOString(),
        decided_by: user.id,
      })
      .eq("id", suggestionId);

    return NextResponse.json({ ok: true });
  }

  // ACCEPT → create action plan
  const title = `Investigate ${cluster.event_type}: ${cluster.failure_mode_key.replaceAll("|", " / ")}`;

  const { data: action, error: actionError } = await supabase
    .from("action_plans")
    .insert({
      org_id: cluster.org_id,
      plant_id: cluster.plant_id,
      area_id: cluster.area_id,
      line_id: cluster.line_id,
      action: title,
      root_cause: cluster.failure_mode_key,
      owner: "Production Engineering",
      status: "Open",
      source: "ai",
      expected_impact: `Impact: ${cluster.total_impact}`,
      ai_cluster_id: cluster.id,
    })
    .select("id")
    .single();

  if (actionError) {
    return NextResponse.json({ error: "Action creation failed" }, { status: 500 });
  }

  // Update suggestion
  await supabase
    .from("ai_action_suggestions")
    .update({
      status: "accepted",
      decided_at: new Date().toISOString(),
      decided_by: user.id,
      action_plan_id: action.id,
    })
    .eq("id", suggestionId);

  return NextResponse.json({ ok: true });
}
