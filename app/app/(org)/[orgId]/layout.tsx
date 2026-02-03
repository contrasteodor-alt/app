

/*import { createSupabaseServerClient } from "@/lib/supabase/server";

const supabase = createSupabaseServerClient();

const {
  data: { user },
} = await supabase.auth.getUser();

console.log("SERVER_AUTH_USER_ID:", user?.id);


import { OrgNavbar } from "@/components/org-navbar";

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <OrgNavbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
*/

import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OrgNavbar } from "@/components/org-navbar";
import { LogoutButton } from "@/components/logout-button";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const supabase = createSupabaseServerClient();

  // 1. Require authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Check user has access to this organization
  const { data: userOrg, error } = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", user.id)
    .eq("org_id", params.orgId)
    .single();

  if (error || !userOrg) {
    notFound();
  }

  // 3. Authenticated + authorized → render org environment
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OrgNavbar />

      <div className="flex justify-end px-6 py-2">
        <LogoutButton />
      </div>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
