

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

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("SERVER_AUTH_USER_ID:", user?.id);

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
