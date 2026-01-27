import { createServerClient } from "@supabase/ssr";

/**
 * IMPORTANT:
 * - NO static import of `cookies`
 * - NO top-level await
 * - EVERYTHING request-scoped
 */
export async function createSupabaseServerClient() {
  // ✅ Lazy import — safe for build
  const { cookies } = await import("next/headers");

  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
