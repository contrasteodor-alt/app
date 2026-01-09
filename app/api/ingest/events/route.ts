import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    const shiftId = searchParams.get("shiftId");
    const lineId = searchParams.get("lineId");
    const eventType = searchParams.get("eventType");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = supabase
      .from("events")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(100);

    if (shiftId) {
      query = query.eq("shift_id", shiftId);
    }

    if (lineId) {
      query = query.eq("line_id", lineId);
    }

    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    if (from) {
      query = query.gte("occurred_at", from);
    }

    if (to) {
      query = query.lte("occurred_at", to);
    }

    const { data, error } = await query;

    if (error) {
      console.error("EVENT QUERY ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ events: data });
  } catch (err) {
    console.error("GET /api/ingest/events failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
