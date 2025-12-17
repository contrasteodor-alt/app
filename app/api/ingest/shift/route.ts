import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isPosInt(n: any) {
  return Number.isInteger(n) && n > 0;
}

async function requireSession() {
  const c = await cookies();
  return c.get("session")?.value;
}

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("shifts")
    .select("*")
    .eq("org_id", "demo-org")
    .order("started_at", { ascending: false })
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shift: data?.[0] ?? null });
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const started_at = body.startedAt;
  const planned_time_min = Number(body.plannedTimeMin);
  const ideal_cycle_sec = Number(body.idealCycleSec);
  const output_units = Number(body.outputUnits);
  const scrap_units = Number(body.scrapUnits);
  const shift_name = String(body.shiftName || "A");

  if (!started_at) return NextResponse.json({ error: "startedAt is required" }, { status: 400 });
  if (!isPosInt(planned_time_min)) return NextResponse.json({ error: "plannedTimeMin must be > 0" }, { status: 400 });
  if (!(ideal_cycle_sec > 0)) return NextResponse.json({ error: "idealCycleSec must be > 0" }, { status: 400 });
  if (!Number.isInteger(output_units) || output_units < 0) return NextResponse.json({ error: "outputUnits must be >= 0" }, { status: 400 });
  if (!Number.isInteger(scrap_units) || scrap_units < 0) return NextResponse.json({ error: "scrapUnits must be >= 0" }, { status: 400 });

  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("shifts")
    .insert({
      org_id: "demo-org",
      shift_name,
      started_at,
      planned_time_min,
      ideal_cycle_sec,
      output_units,
      scrap_units,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shift: data });
}
