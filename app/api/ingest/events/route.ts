import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

type EventType = "downtime" | "changeover" | "scrap" | "quality" | "note";

type NewEvent = {
  type: EventType;
  lineId: string;
  timestamp: string;
  durationMin?: number;
  qty?: number;
  category: string;
  comment?: string;
  operator?: string;
  station?: string;
  tags?: string[];
};

type StoredEvent = NewEvent & { id: string; createdAt: string };

// ⚠️ Demo-only in-memory store (resets on restart). Replace with DB next.
const g = globalThis as any;
g.__INGEST_EVENTS__ = g.__INGEST_EVENTS__ || [];
const store: StoredEvent[] = g.__INGEST_EVENTS__;

function requireSession() {
  const session = (cookies() as any).get?.("session")?.value;
  return session;
}

function isPosInt(n: any) {
  return Number.isInteger(n) && n > 0;
}

function validate(e: NewEvent): string | null {
  if (!e.lineId) return "lineId is required";
  if (!e.timestamp) return "timestamp is required";
  if (!e.category) return "category is required";
  if (!e.type) return "type is required";

  const needsDuration = e.type === "downtime" || e.type === "changeover";
  const needsQty = e.type === "scrap" || e.type === "quality";

  if (needsDuration) {
    if (!isPosInt(e.durationMin)) return "durationMin must be a positive integer";
  } else if (e.durationMin != null) {
    return "durationMin must be empty for this type";
  }

  if (needsQty) {
    if (!isPosInt(e.qty)) return "qty must be a positive integer";
  } else if (e.qty != null) {
    return "qty must be empty for this type";
  }

  return null;
}

function newId() {
  return `ev_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

export async function GET() {
  const session = requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Return most recent first
  const events = [...store].reverse().slice(0, 200);
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as NewEvent;
  const v = validate(body);
  if (v) return NextResponse.json({ error: v }, { status: 400 });

  const event: StoredEvent = {
    ...body,
    id: newId(),
    createdAt: new Date().toISOString(),
  };

  store.push(event);
  return NextResponse.json({ event });
}
