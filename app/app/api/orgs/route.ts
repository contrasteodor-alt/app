/*import { NextResponse } from "next/server";
//import { createSupabaseServerClient } from "@/lib/supabase/server";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    "https://azusybxftgymvlwokfmy.functions.supabase.co/orgs",
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const json = await res.json();
  return NextResponse.json(json);
}*/

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  const { createSupabaseServerClient } = await import(
    "@/lib/supabase/server"
  );

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("org_id, name, location");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
