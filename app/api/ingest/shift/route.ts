import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const {
      orgId,
      shiftName,
      startedAt,
      plannedTimeMin,
      idealCycleSec,
      outputUnits,
      scrapUnits,
    } = body;

    const { data, error } = await supabase
      .from("shifts")
      .insert({
        org_id: orgId ?? "demo-org",
        shift_name: shiftName,
        started_at: startedAt,
        planned_time_min: plannedTimeMin,
        ideal_cycle_sec: idealCycleSec,
        output_units: outputUnits,
        scrap_units: scrapUnits,
      })
      .select()
      .single();

    if (error) {
      console.error("SHIFT INSERT ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shift: data });
  } catch (err) {
    console.error("POST /shift failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
