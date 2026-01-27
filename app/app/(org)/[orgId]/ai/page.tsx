export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Page({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  // keep your existing AI page logic here
  // auth + cookies + supabase require request scope

  return (
    <div>
      <h1>AI</h1>
      <p>Organization: {orgId}</p>
    </div>
  );
}
