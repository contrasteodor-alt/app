import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const isDemo = process.env.NEXT_PUBLIC_APP_MODE === "demo";

  const url = isDemo
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_DEMO
    : process.env.NEXT_PUBLIC_SUPABASE_URL_PROD;

  const key = isDemo
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEMO
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD;

  if (!url || !key) {
    return createBrowserClient("", "");
  }

  return createBrowserClient(url, key);
}
