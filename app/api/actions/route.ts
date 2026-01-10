import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ActionPlanPayload = {
  orgId: string;
  lineId: string;
  action: string;
  rootCause: string;
  owner: string;
  dueDate: string;
  status: "Open" | "Closed" | "Delayed" | "Canceled";
  aiSource?: {
    confidence?: string;
    expectedImpact?: string;
    evidenceEventIds?: string[];
  };
};

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = (await req.json()) as ActionPlanPayload;

    // Basic validation (engineering-grade, not UX-grade)
    if (!body.orgId || !body.lineId || !body.action) {
      return NextResponse.json(
        { error: "Missing required action fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("action_plans")
      .insert({
        org_id: body.orgId,
        line_id: body.lineId,
        action: body.action,
        root_cause: body.rootCause,
        owner: body.owner,
        due_date: body.dueDate,
        status: body.status ?? "Open",

        // AI metadata (optional but critical for credibility)
        ai_confidence: body.aiSource?.confidence ?? null,
        expected_impact: body.aiSource?.expectedImpact ?? null,
        evidence_event_ids: body.aiSource?.evidenceEventIds ?? [],
        source: "AI",
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
/* =========================
   GET ACTION PLANS
========================= */
export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    const orgId = searchParams.get("orgId");
    const lineId = searchParams.get("lineId");
    const status = searchParams.get("status"); // optional

    let query = supabase
      .from("action_plans")
      .select("*")
      .order("due_date", { ascending: true });

    if (orgId) {
      query = query.eq("org_id", orgId);
    }

    if (lineId) {
      query = query.eq("line_id", lineId);
    }

    if (status) {
      query = query.eq("status", status);
    } else {
      // default: only active actions
      query = query.in("status", ["Open", "Delayed"]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("LOAD ACTION PLANS ERROR:", error);
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
