

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
import { LogoutButton } from "@/components/logout-button";


export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const supabase = createSupabaseServerClient();

  // 1. Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Check user has access to this org
  const { data: userOrg, error: userOrgError } = await supabase
    .from("user_orgs")
    .select("org_id")
    .eq("user_id", user.id)
    .eq("org_id", params.orgId);

  if (userOrgError) {
    throw userOrgError;
  }

  if (!userOrg || userOrg.length === 0) {
    // user authenticated but has no access to this org
    notFound();
  }

  // 3. Org exists & user has access → render
  return (
    <>
      <div className="flex justify-end p-4">
        <LogoutButton />
      </div>
      {children}
    </>
  );
  
}
