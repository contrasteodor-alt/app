export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { redirect } from "next/navigation";
//import { createSupabaseServerClient } from "@/lib/supabase/server";

const { createSupabaseServerClient } = await import(
  "@/lib/supabase/server"
);


export async function resolveOrg(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    redirect("/login");
  }

  return data.org_id as string;
}
