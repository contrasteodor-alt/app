import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { orgId: string } }
) {
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

  // Load suggestion
  const { data: suggestion, error: suggestionError } = await supabase
    .from("ai_action_suggestions")
    .select("id, cluster_id, status")
    .eq("id", suggestionId)
    .single();

  if (suggestionError || !suggestion) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }

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

  // ACCEPT → load cluster
  const { data: cluster, error: clusterError } = await supabase
  .from("ai_event_clusters")
  .select(`
    id,
    org_id,
    line_id,
    event_type,
    failure_mode_key
  `)
  .eq("id", suggestion.cluster_id)
  .single();


  if (clusterError || !cluster) {
    return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
  }

  
  if (suggestion.status !== "pending") {
    return NextResponse.json({ ok: true });
  }
 
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);


  // Build readable action title from AI context
const readableFailure = cluster.failure_mode_key
.split("|")
.slice(1)
.join(" ");

const actionTitle =
cluster.event_type === "scrap"
  ? `Reduce scrap caused by ${readableFailure}`
  : `Investigate repeated ${readableFailure} downtime`;

// Create Action Plan
const { error: actionError } = await supabase
.from("action_plans")
.insert({
  org_id: cluster.org_id,
  line_id: cluster.line_id,
  action_date: new Date().toISOString().slice(0, 10),
  due_date: dueDate.toISOString().slice(0, 10),
  action: actionTitle,
  root_cause: cluster.failure_mode_key,
  failure_mode_key: cluster.failure_mode_key,
  owner:
    cluster.event_type === "scrap"
      ? "Quality / Production"
      : "Production / Maintenance",
  status: "Open",
  source: "ai",
  ai_cluster_id: cluster.id,
});


if (actionError) {
return NextResponse.json(
  { error: actionError.message },
  { status: 500 }
);
}


  // Mark suggestion accepted
  const { error: updateError } = await supabase
  .from("ai_action_suggestions")
  .update({
    status: "accepted",
    decided_at: new Date().toISOString(),
    decided_by: user.id,
  })
  .eq("id", suggestionId)


if (updateError) {
  console.error("Failed to update ai_action_suggestions:", updateError);
  return NextResponse.json(
    { error: updateError.message },
    { status: 500 }
  );
}


  return NextResponse.json({ ok: true });
}
