export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  const { createSupabaseServerClient } = await import(
    "@/lib/supabase/server"
  );

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    error,
  });
}
