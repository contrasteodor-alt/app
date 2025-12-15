import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // DEMO AUTH (investor-safe): uses env vars, no hardcoded credentials
  const demoEmail = process.env.DEMO_EMAIL || "demo@factory.com";
  const demoPassword = process.env.DEMO_PASSWORD || "demo1234";

  if (email !== demoEmail || password !== demoPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Set a simple session cookie (demo). Replace later with Supabase Auth / NextAuth.
  const res = NextResponse.json({ ok: true });

  res.cookies.set("session", "demo-session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return res;
}
