/* export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { redirect } from "next/navigation";
//import { createSupabaseServerClient } from "@/lib/supabase/server";


const { createSupabaseServerClient } = await import(
  "@/lib/supabase/server"
);


export async function requireOrgAccess(orgId: string) {
  const supabase = await createSupabaseServerClient();


  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("user_orgs")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("org_id", orgId)
    .maybeSingle();

  if (!membership) {
    // securitate HARD
    redirect("/org"); // sau /403 dacă vrei explicit
  }

  return {
    user: userData.user,
    orgId,
  };
}
*/

export async function requireOrgAccess(orgId: string) {
  if (process.env.DEMO_MODE === "true") {
    return true;
  }

  throw new Error("Auth disabled temporarily");
}
