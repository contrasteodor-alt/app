import { NextResponse } from "next/server";
//import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";


type EventType = "downtime" | "changeover" | "scrap" | "quality";

export async function POST(req: Request) {
  try {
    const supabase = supabaseAdmin;
    const body = await req.json();

    const t = body.type as EventType;
    const needsDuration = t === "downtime" || t === "changeover";
    const needsQty = t === "scrap" || t === "quality";

    const { error, data } = await supabase
      .from("events")
      .insert({
        shift_id: body.shiftId,
        type: t,
        duration_minutes: needsDuration ? body.durationMinutes ?? null : null,
        quantity: needsQty ? body.quantity ?? null : null,
        reason: body.reason ?? null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Insert event failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("POST /api/ingest/events failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
