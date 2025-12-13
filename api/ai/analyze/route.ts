import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are a Lean Manufacturing expert. Answer concisely and structurally (PDCA, 5 Why, countermeasures, KPIs).",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json({ error: errText }, { status: 500 });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
