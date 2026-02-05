import { createSupabaseServerClient } from "@/lib/supabase/server";

type MasterData = {
  lineMap: Map<string, string>; // line_code -> line_uuid (lines.id)
  shiftMap: Map<string, { id: string; started_at: string }>; // shift_name -> data
};

export async function resolveMasterData(
  orgId: string
): Promise<MasterData> {
  const supabase = createSupabaseServerClient();

  /* -------------------- LINES -------------------- */
  const { data: lines, error: lineError } = await supabase
    .from("lines")
    .select("id, line_code")
    .eq("org_id", orgId);

  if (lineError || !lines) {
    throw new Error("Failed to load production lines");
  }

  const lineMap = new Map<string, string>();

  for (const l of lines) {
    if (!l.line_code) continue;

    // Enforce uniqueness explicitly (important for trust)
    if (lineMap.has(l.line_code)) {
      throw new Error(
        `Duplicate line_code detected: "${l.line_code}". Line codes must be unique per organization.`
      );
    }

    lineMap.set(l.line_code, l.id);
  }

  /* -------------------- SHIFTS -------------------- */
  const { data: shifts, error: shiftError } = await supabase
    .from("shifts")
    .select("id, shift_name, started_at")
    .eq("org_id", orgId);

  if (shiftError || !shifts) {
    throw new Error("Failed to load shifts");
  }

  const shiftMap = new Map<string, { id: string; started_at: string }>();

  for (const s of shifts) {
    if (!s.shift_name) continue;

    if (shiftMap.has(s.shift_name)) {
      throw new Error(
        `Duplicate shift name detected: "${s.shift_name}". Shift names must be unique per organization.`
      );
    }

    shiftMap.set(s.shift_name, {
      id: s.id,
      started_at: s.started_at,
    });
  }

  return {
    lineMap,
    shiftMap,
  };
}
