import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const mode = process.env.NEXT_PUBLIC_APP_MODE;

  const supabaseUrl =
    mode === "demo"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEMO
      : process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    mode === "demo"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEMO
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase server env vars are missing");
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
