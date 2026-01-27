/* export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireSession } from "@/lib/auth/requireSession";
import { resolveOrg } from "@/lib/org/resolveOrg";
import { redirect } from "next/navigation";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  const user = await requireSession();
  const resolvedOrgId = await resolveOrg(user.id);

  if (orgId !== resolvedOrgId) {
    redirect(`/org/${resolvedOrgId}`);
  }

  return <>{children}</>;
}
*/

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await fetch("http://localhost:3000/api/auth/check", {
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  return <>{children}</>;
}
