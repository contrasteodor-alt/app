import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import IngestClient from "./ingest-client";

export default async function IngestPage() {
  const session = (await cookies()).get("session")?.value;
  if (!session) redirect("/login?next=/ingest");

  return <IngestClient />;
}
