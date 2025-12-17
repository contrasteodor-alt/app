import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient(); // ✅ correct factory
    const body = await req.json();

    const { data, error } = await supabase
      .from("action_plans")
      .insert({
        org_id: body.orgId,
        line_id: body.lineId,
        date_of_action: body.dateOfAction,
        action: body.action,
        root_cause: body.rootCause,
        owner: body.owner,
        due_date: body.dueDate,
        status: body.status ?? "Open",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Insert action_plan failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("POST /api/actions failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
