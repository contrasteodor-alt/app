export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Page({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  // keep your existing ingest logic here
  // this page uses auth / supabase / cookies

  return (
    <div>
      <h1>Ingest</h1>
      <p>Organization: {orgId}</p>
    </div>
  );
}
