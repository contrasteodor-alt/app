import Link from "next/link";
import { getOrganization } from "../../../lib/data/organizations";
import { getLinesForOrg } from "../../../lib/data/lines";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export default async function Page({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = createSupabaseServerClient();

  const org = await getOrganization(params.orgId);
  const lines = await getLinesForOrg(supabase, params.orgId);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <p className="text-muted-foreground">
          Select a production line to continue.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {lines.map((line) => (
          <Link
            key={line.id}
            href={`/${params.orgId}/lines/${line.id}`}
            className="rounded-lg border p-4 hover:bg-muted"
          >
            <h2 className="font-semibold">{line.name}</h2>
            <p className="text-sm text-muted-foreground">
              Status: {line.status}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
