export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ShiftDraft = {
  date: string; // YYYY-MM-DD
  shift: "A" | "B" | "C";
  lineId: string;
  product: string;
  targetPerHour: number;
  plannedMinutes: number;
};

type DowntimeDraft = {
  minutes: number;
  reason: string;
  details: string;
  reaction: string;
};

type ScrapDraft = {
  qty: number;
  reason: string;
  details: string;
  reaction: string;
};

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const body = await req.json();
    const { shift, downtime, scrap } = body as {
      shift: ShiftDraft;
      downtime: DowntimeDraft[];
      scrap: ScrapDraft[];
    };

    // ─────────────────────────────────────────────
    // 1️⃣ Minimal validation (keep v1 simple)
    // ─────────────────────────────────────────────
    if (
      !shift ||
      !shift.date ||
      !shift.shift ||
      !shift.lineId ||
      !shift.targetPerHour ||
      !shift.plannedMinutes
    ) {
      return NextResponse.json(
        { error: "Invalid shift data" },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────
    // 2️⃣ Resolve org from auth (secure)
    // ─────────────────────────────────────────────
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: userOrg, error: orgError } = await supabase
      .from("user_orgs")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (orgError || !userOrg?.org_id) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 }
      );
    }

    const orgId = userOrg.org_id;

    // ─────────────────────────────────────────────
    // 3️⃣ Insert SHIFT
    // ─────────────────────────────────────────────
    const idealCycleSec = 3600 / shift.targetPerHour;

    // simple shift start (v1): date at 06:00
    const startedAt = new Date(`${shift.date}T06:00:00Z`).toISOString();

    const totalScrap = Array.isArray(scrap)
      ? scrap.reduce((sum, s) => sum + (s.qty || 0), 0)
      : 0;

    const { data: shiftRow, error: shiftError } = await supabase
      .from("shifts")
      .insert({
        org_id: orgId,
        shift_name: shift.shift,
        started_at: startedAt,
        planned_time_min: shift.plannedMinutes,
        ideal_cycle_sec: idealCycleSec,
        output_units: 0,
        scrap_units: totalScrap,
      })
      .select("id")
      .single();

    if (shiftError || !shiftRow) {
      return NextResponse.json(
        { error: "Failed to create shift", details: shiftError },
        { status: 500 }
      );
    }

    const shiftId = shiftRow.id;

    // ─────────────────────────────────────────────
    // 4️⃣ Build EVENTS payload
    // ─────────────────────────────────────────────
    const occurredAt = startedAt;

    const downtimeEvents =
      Array.isArray(downtime) && downtime.length > 0
        ? downtime.map((d) => ({
            shift_id: shiftId,
            line_id: shift.lineId,
            event_type: "downtime",
            category: d.reason,
            duration_min: d.minutes,
            occurred_at: occurredAt,
            comment: `${d.details || ""} | reaction: ${d.reaction || ""}`,
          }))
        : [];

    const scrapEvents =
      Array.isArray(scrap) && scrap.length > 0
        ? scrap.map((s) => ({
            shift_id: shiftId,
            line_id: shift.lineId,
            event_type: "scrap",
            category: s.reason,
            qty: s.qty,
            occurred_at: occurredAt,
            comment: `${s.details || ""} | reaction: ${s.reaction || ""}`,
          }))
        : [];

    const allEvents = [...downtimeEvents, ...scrapEvents];

    // ─────────────────────────────────────────────
    // 5️⃣ Insert EVENTS (if any)
    // ─────────────────────────────────────────────
    if (allEvents.length > 0) {
      const { error: eventsError } = await supabase
        .from("events")
        .insert(allEvents);

      if (eventsError) {
        return NextResponse.json(
          { error: "Failed to insert events", details: eventsError },
          { status: 500 }
        );
      }
    }

    // ─────────────────────────────────────────────
    // 6️⃣ Done
    // ─────────────────────────────────────────────
    return NextResponse.json({
      ok: true,
      shiftId,
      eventsInserted: allEvents.length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
