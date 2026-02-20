import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getLineForecast } from "@/lib/data/forecast-engine";

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );

  const result = await getLineForecast(
    supabase,
    "your-org-id",
    "your-line-uuid",
    "oee"
  );

  return NextResponse.json(result);
}
