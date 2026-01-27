import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function POST(req: Request) {
  const { events } = await req.json();

  if (!events || events.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  // MVP heuristic (replace later with LLM)
  const rootCause = "Unclear standard or process deviation";
  const action = "Review standard work and retrain operators";

  return NextResponse.json({
    suggestion: {
      rootCause,
      action,
      confidence: "0.65",
      expectedImpact: "Reduced recurrence of similar events",
    },
  });
}
