import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type EventType = "downtime" | "changeover" | "scrap" | "quality" | "note";

function isPosInt(n: any) {
  return Number.isInteger(n) && n > 0;
}

async function requireSession() {
  const c = await cookies();
  return c.get("session")?.value;
}

function validate(body: any): string | null {
  if (!body.shiftId) return "shiftId is required (save shift header first)";
  if (!body.lineId) return "lineId is required";
  if (!body.timestamp) return "timestamp is required";
  if (!body.category) return "category is required";
  if (!body.type) return "type is required";

  const t = body.type as EventType;
  const needsDuration = t === "downtime" || t === "changeover";
  const needsQty = t === "scrap" || t === "quality";

  if (needsDuration) {
    if (!isPosInt(Number(body.durationMin))) return "durationMin must be a positive integer";
  } else if (body.durationMin != null) {
    return "durationMin must be empty for this type";
  }

  if (needsQty) {
    if (!isPosInt(Number(body.qty))) return "qty must be a positive integer";
  } else if (body.qty != null) {
    return "qty must be empty for this type";
  }

  return null;
}

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const shiftId = url.searchParams.get("shiftId");

  const sb = supabaseAdmin();
  let q = sb.from("events").select("*").order("occurred_at", { ascending: false }).limit(200);

  if (shiftId) q = q.eq("shift_id", shiftId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Keep UI contract similar to before
  const events = (data ?? []).map((e: any) => ({
    id: e.id,
    createdAt: e.created_at,
    type: e.event_type,
    lineId: e.line_id,
    timestamp: e.occurred_at,
    durationMin: e.duration_min,
    qty: e.qty,
    category: e.category,
    station: e.station,
    operator: e.operator,
    comment: e.comment,
  }));

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const v = validate(body);
  if (v) return NextResponse.json({ error: v }, { status: 400 });

  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("events")
    .insert({
      shift_id: body.shiftId,
      line_id: body.lineId,
      event_type: body.type,
      category: body.category,
      occurred_at: body.timestamp,
      duration_min: body.durationMin ?? null,
      qty: body.qty ?? null,
      station: body.station ?? null,
      operator: body.operator ?? null,
      comment: body.comment ?? null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    event: {
      id: data.id,
      createdAt: data.created_at,
      type: data.event_type,
      lineId: data.line_id,
      timestamp: data.occurred_at,
      durationMin: data.duration_min,
      qty: data.qty,
      category: data.category,
      station: data.station,
      operator: data.operator,
      comment: data.comment,
    },
  });
}
