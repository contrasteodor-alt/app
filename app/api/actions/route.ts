import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createClient();

  const { error, data } = await supabase
    .from("action_plans")
    .insert({
      org_id: body.orgId,
      line_id: body.lineId,
      shift_id: body.shiftId ?? null,
      action_date: body.actionDate,
      action: body.action,
      root_cause: body.rootCause,
      owner: body.owner,
      due_date: body.dueDate,
      status: body.status,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ action: data });
}
