import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AIClientPage from "./ai-client";

export default async function AIPage() {
  const session = (await cookies()).get("session")?.value;
  if (!session) redirect("/login?next=/ai");

  return <AIClientPage />;
}
