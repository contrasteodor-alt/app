"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";


console.log("SB URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SB KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 12));


export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const isDemo = searchParams.get("mode") === "demo";

  const [email, setEmail] = useState(
    isDemo ? "demo_org@factory.com" : ""
  );
  const [password, setPassword] = useState(
    isDemo ? "demo1234" : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-center">
          {isDemo ? "Explore Demo Factory" : "Sign in"}
        </h1>

        {isDemo && (
          <p className="text-sm text-center text-gray-500">
            Demo organization — full access, safe data.
          </p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded border px-3 py-2"
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="button"
          onClick={onLogin}
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
