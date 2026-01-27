import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


type EventType = "downtime" | "changeover" | "scrap" | "quality" | "note";

/* =========================
   GET EVENTS FOR SHIFT
========================= */
export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    const orgId = searchParams.get("orgId");
    const shiftId = searchParams.get("shiftId");

    if (!orgId || !shiftId) {
      return NextResponse.json(
        { error: "orgId and shiftId query params required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("org_id", orgId)
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

/* =========================
   POST NEW EVENT
========================= */
export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const {
      orgId,
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

    if (!orgId || !shiftId || !lineId || !type || !category || !timestamp) {
      return NextResponse.json(
        { error: "Missing required event fields" },
        { status: 400 }
      );
    }

    const occurredAt = new Date(timestamp);
    if (isNaN(occurredAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid timestamp format" },
        { status: 400 }
      );
    }

    const payload = {
      org_id: orgId,
      shift_id: shiftId,
      line_id: lineId,
      event_type: type as EventType,
      category,
      occurred_at: occurredAt.toISOString(),
      duration_min: durationMin ?? null,
      qty: qty ?? null,
      station: station || null,
      operator: operator || null,
      comment: comment || null,
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
