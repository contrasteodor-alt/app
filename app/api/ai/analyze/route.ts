import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = (await cookies()).get("session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await r.json();

  if (!r.ok) {
    return NextResponse.json({ error: data?.error?.message || "OpenAI error" }, { status: 500 });
  }

  return NextResponse.json({ text: data?.choices?.[0]?.message?.content ?? "" });
}
