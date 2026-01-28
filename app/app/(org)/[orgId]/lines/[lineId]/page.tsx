export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

type LinePageProps = {
  params: Promise<{
    orgId: string;
    lineId: string;
  }>;
};

export default async function LinePage({ params }: LinePageProps) {
  const { orgId, lineId } = await params;

  // ✅ Lazy imports — keep cookies safe
  const { createSupabaseServerClient } = await import(
    "@/lib/supabase/server"
  );
  const { getOrganization } = await import(
    "@/lib/data/organizations"
  );
  const { getLineById } = await import(
    "@/lib/data/lines"
  );

  const supabase = await createSupabaseServerClient();

  const org = await getOrganization( orgId);
  const line = await getLineById(supabase, lineId);

  if (!org || !line) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold">{line.name}</h1>
        <p className="text-muted-foreground">
          Organization: {org.name}
        </p>
        <p>Status: {line.status ?? "unknown"}</p>
      </div>

      {/* Actions */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href={`/${orgId}/ingest?lineId=${lineId}`}
          className="rounded-lg border p-4 hover:bg-muted"
        >
          <h2 className="font-semibold">Ingest Data</h2>
          <p className="text-sm text-muted-foreground">
            Add shift data and production events
          </p>
        </Link>
      </section>
    </div>
  );
}
