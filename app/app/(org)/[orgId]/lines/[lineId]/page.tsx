export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

type LinePageProps = {
  params: Promise<{
    orgId: string;
    lineId: string;
  }>;
};

export default async function LinePage({ params }: LinePageProps) {
  const { orgId, lineId } = await params;

  // ✅ Lazy import — NOTHING at module scope touches cookies
  const { createSupabaseServerClient } = await import(
    "@/lib/supabase/server"
  );
  const { getOrganizationById } = await import(
    "@/lib/data/organizations"
  );
  const { getLineById } = await import(
    "@/lib/data/lines"
  );

  const supabase = await createSupabaseServerClient();

  const org = await getOrganizationById(supabase, orgId);
  const line = await getLineById(supabase, lineId);

  if (!org || !line) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-semibold">{line.name}</h1>
      <p className="text-muted-foreground">
        Organization: {org.name}
      </p>
      <p>Status: {line.status ?? "unknown"}</p>
    </div>
  );
}
