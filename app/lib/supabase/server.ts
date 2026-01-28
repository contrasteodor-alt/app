import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const isDemo = process.env.NEXT_PUBLIC_APP_MODE === "demo";

  const url = isDemo
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEMO
    : process.env.NEXT_PUBLIC_SUPABASE_URL_PROD;

  const key = isDemo
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEMO
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD;

  const cookieStore = cookies();

  if (!url || !key) {
    return createServerClient("", "", { cookies: { get: () => undefined } });
  }

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
