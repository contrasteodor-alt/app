import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("shifts")
    .select("id")
    .eq("org_id", orgId)
    .order("started_at", { ascending: false })
    .limit(1)
    

    if (!data || data.length === 0) {
      return NextResponse.json({ shiftId: null });
    }
    
    return NextResponse.json({ shiftId: data[0].id });
    
}
