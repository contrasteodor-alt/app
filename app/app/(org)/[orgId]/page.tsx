export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Page({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  // keep your existing overview / redirect / logic here
  // this page depends on auth + cookies + supabase

  return (
    <div>
      <h1>Organization</h1>
      <p>Organization: {orgId}</p>
    </div>
  );
}
