import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/* =========================
   GET ACTION PLANS
========================= */
export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { error: "orgId query param required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("action_plans")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD ACTIONS ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ actions: data });
  } catch (err) {
    console.error("GET /api/actions failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   POST ACTION PLAN
========================= */
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const {
      orgId,
      lineId,
      action,
      rootCause,
      owner,
      dueDate,
      status,
      aiSource,
    } = body;

    if (!orgId || !action || !rootCause || !owner || !dueDate) {
      return NextResponse.json(
        { error: "Missing required action fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("action_plans")
      .insert({
        org_id: orgId,
        line_id: lineId,
        action,
        root_cause: rootCause,
        owner,
        due_date: dueDate,
        status: status ?? "Open",
        source: aiSource ? "AI" : "manual",
        ai_confidence: aiSource?.confidence ?? null,
        expected_impact: aiSource?.expectedImpact ?? null,
        evidence_event_ids: aiSource?.evidenceEventIds ?? [],
      })
      .select()
      .single();

    if (error) {
      console.error("ACTION INSERT ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ action: data });
  } catch (err) {
    console.error("POST /api/actions failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
