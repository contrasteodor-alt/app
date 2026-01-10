import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ActionsClient from "./actions-client";

export default async function ActionsPage() {
  const session = (await cookies()).get("session")?.value;
  if (!session) redirect("/login?next=/actions");

  return <ActionsClient />;
}
