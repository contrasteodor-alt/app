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
export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

