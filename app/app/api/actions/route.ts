import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


/* =========================
   GET ACTION PLANS BY SHIFT
========================= */
export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const shiftId = searchParams.get("shiftId");

  if (!shiftId) {
    return NextResponse.json({ error: "shiftId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("action_plans")
    .select("*")
    .eq("shift_id", shiftId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ actions: data });
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
      shiftId,
      lineId,
      action,
      rootCause,
      owner,
      dueDate,
      status,
      aiSource,
    } = body;

    if (!orgId || !shiftId || !action || !rootCause || !owner || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("action_plans")
      .insert({
        org_id: orgId,
        shift_id: shiftId,
        line_id: lineId ?? null,
        action_date: new Date().toISOString(),
        action: action ?? null,
        root_cause: rootCause ?? null,
        owner: owner ?? null,
        due_date: dueDate ?? null,
        status: status ?? "Open",
        source: aiSource ? "AI" : "manual",
        evidence_event_ids: aiSource?.evidenceEventIds ?? [],
      })
      
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ action: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
