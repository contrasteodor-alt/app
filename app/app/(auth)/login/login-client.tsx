"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PublicNavbar } from "@/components/public-navbar";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const mode = searchParams.get("mode") ?? "login";
  const isDemo = mode === "demo";
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill demo user
  useEffect(() => {
    if (isDemo) {
      setEmail("demo2@factory.com");
      setPassword("");
    }
  }, [isDemo]);

  async function onSubmit() {
    setLoading(true);
    setError(null);

    // SIGNUP (Get Started)
    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("already") ||
          error.message.toLowerCase().includes("registered")
        ) {
          setError("E-mail address already used. Please log in.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      // NEW user only → organization setup
      router.push("/setup-organization");
      router.refresh();
      return;
    }

    // LOGIN or DEMO
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Redirect after login
    if (isDemo) {
      router.push("/b1e703aa-b2a7-4bc4-8f39-4cad931eaa25");
    } else {
      router.push("/");
    }

    router.refresh();
  }

  return (
    <>
      <PublicNavbar />

      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold text-center">
            {isSignup && "Create your account"}
            {mode === "login" && "Sign in"}
            {isDemo && "Explore Live Demo"}
          </h1>

          {isDemo && (
            <p className="text-sm text-center text-gray-500">
              Demo organization — full access, safe data.
            </p>
          )}

          <input
            type="email"
            value={email}
            disabled={isDemo}
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "Please wait…"
              : isSignup
              ? "Create account"
              : "Sign in"}
          </button>
        </div>
      </div>
    </>
  );
}
