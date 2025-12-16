import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "./home-client";

export default async function HomePage() {
  const session = (await cookies()).get("session")?.value;
  if (!session) redirect("/login?next=/");

  return <HomeClient />;
}
