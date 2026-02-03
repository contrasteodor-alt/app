import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ResolveOrgPage() {
  const supabase = createSupabaseServerClient();

  // 1. Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Get user organizations
  const { data: userOrgs, error } = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  // 3. Decide where to go
  if (!userOrgs || userOrgs.length === 0) {
    redirect("/setup-organization");
  }

  // 4. Single org → go there
  redirect(`/${userOrgs[0].org_id}`);
}
