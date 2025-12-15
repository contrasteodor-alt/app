import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  ProductionEvent,
  EngineeringFinding,
  RecommendedAction
} from "@/lib/domain";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { events, findings } = await req.json() as {
    events: ProductionEvent[];
    findings: EngineeringFinding[];
  };
const session = (await cookies()).get("session")?.value;
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

  const prompt = `
You are a senior manufacturing engineer.

INPUT:
- Events: ${JSON.stringify(events)}
- Findings: ${JSON.stringify(findings)}

TASK:
Generate assertive but justified improvement actions.
Only use Lean Manufacturing logic.
Do NOT invent data.
Return JSON array of actions.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const actions: RecommendedAction[] = JSON.parse(
    completion.choices[0].message.content!
  );

  return NextResponse.json(actions);
}
