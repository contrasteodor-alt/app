import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");

  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("lines")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lines: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  const body = await req.json();

  const orgId = String(body?.orgId ?? "").trim();
  const name = String(body?.name ?? "").trim();

  if (!orgId || !name) {
    return NextResponse.json({ error: "orgId + name required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("lines")
    .insert({ org_id: orgId, name })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ line: data });
}
