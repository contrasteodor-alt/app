import { redirect } from "next/navigation";

type OrgRootPageProps = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgRootPage({
  params,
}: OrgRootPageProps) {
  const { orgId } = await params;

  // Default entry point for an organization
  redirect(`/${orgId}/overview`);
}
