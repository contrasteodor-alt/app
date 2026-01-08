import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type EventPayload = {
  shiftId: string;
  lineId: string;
  type: string;
  category: string;
  timestamp: string;
  durationMin?: number;
  qty?: number;
  station?: string;
  operator?: string;
  comment?: string;
};

/* ============================
   POST — insert event
============================ */
export async function POST(req: Request) {
  try {
    const body: EventPayload = await req.json();

    if (!body.shiftId) {
      return NextResponse.json(
        { error: "shiftId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin(); // ✅ CREATED INSIDE HANDLER

    const payload = {
      shift_id: body.shiftId,
      line_id: body.lineId,
      event_type: body.type,
      category: body.category,
      occurred_at: new Date(body.timestamp).toISOString(),
      duration_min: body.durationMin ?? null,
      qty: body.qty ?? null,
      station: body.station ?? null,
      operator: body.operator ?? null,
      comment: body.comment ?? null,
    };

    const { data, error } = await supabase
      .from("events")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("EVENT INSERT ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data });
  } catch (err) {
    console.error("POST /api/ingest/events failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ============================
   GET — load events by shift
============================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shiftId = searchParams.get("shiftId");

    if (!shiftId) {
      return NextResponse.json(
        { error: "shiftId query param required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin(); // ✅ CREATED INSIDE HANDLER

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("shift_id", shiftId)
      .order("occurred_at", { ascending: false });

    if (error) {
      console.error("LOAD EVENTS ERROR:", error);
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
