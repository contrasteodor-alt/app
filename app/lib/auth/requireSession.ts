export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { redirect } from "next/navigation";
// import { createSupabaseServerClient } from "@/lib/supabase/server";

const { createSupabaseServerClient } = await import(
  "@/lib/supabase/server"
);


export async function requireSession() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
