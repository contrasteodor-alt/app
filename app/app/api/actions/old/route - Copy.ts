import { NextResponse } from "next/server";
//import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";



export const runtime = "nodejs";

type ActionStatus = "Open" | "Closed" | "Delayed" | "Canceled";

interface ActionPayload {
  orgId: string;
  lineId: string;
  shiftId: string;
  actionDate: string;
  action: string;
  rootCause: string;
  owner: string;
  dueDate: string;
  status: ActionStatus;
}

export async function POST(req: Request) {
  try {
    const body: ActionPayload = await req.json();

    const {
      orgId,
      lineId,
      shiftId,
      actionDate,
      action,
      rootCause,
      owner,
      dueDate,
      status,
    } = body;

    if (!orgId || !lineId || !shiftId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("action_plans")
      .insert({
        org_id: orgId,
        line_id: lineId,
        shift_id: shiftId,
        action_date: actionDate,
        action,
        root_cause: rootCause,
        owner,
        due_date: dueDate,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("ACTION INSERT ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
