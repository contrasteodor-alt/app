"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextPath = useMemo(() => sp.get("next") || "/select-org", [sp]);

  const [email, setEmail] = useState("demo@factory.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onLogin() {
    setLoading(true);
    setErr("");

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await r.json();
      if (!r.ok) {
        setErr(data?.error || "Login failed");
        return;
      }

   window.location.href = nextPath || "/select-org";


    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Demo access (session cookie). Replace later with Supabase Auth / SSO.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Factory</CardTitle>
            <CardDescription>Engineering-grade KPI analysis workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </div>

            {err ? <p className="text-sm text-red-600 whitespace-pre-wrap">{err}</p> : null}

            <Button onClick={onLogin} disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-xs text-muted-foreground">
              Tip: credentials are controlled by Railway Variables: <code>DEMO_EMAIL</code>, <code>DEMO_PASSWORD</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
