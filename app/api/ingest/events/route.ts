import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type EventType = "downtime" | "changeover" | "scrap" | "quality" | "note";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const {
      shiftId,
      lineId,
      type,
      category,
      timestamp,
      durationMin,
      qty,
      station,
      operator,
      comment,
    } = body;

    if (!shiftId || !lineId || !type || !category || !timestamp) {
      return NextResponse.json(
        { error: "Missing required event fields" },
        { status: 400 }
      );
    }

    // ✅ HARD NORMALIZATION (critical)
    const occurredAt = new Date(timestamp);
    if (isNaN(occurredAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid timestamp format" },
        { status: 400 }
      );
    }

    const payload = {
      shift_id: shiftId,
      line_id: lineId,
      event_type: type as EventType,
      category,
      occurred_at: occurredAt.toISOString(), // ✅ guaranteed ISO
      duration_min: durationMin ?? null,
      qty: qty ?? null,
      station: station || null,
      operator: operator || null,
      comment: comment || null,
    };

    console.log("INSERT EVENT PAYLOAD:", payload);

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
