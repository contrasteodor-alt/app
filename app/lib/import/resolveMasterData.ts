import { createSupabaseServerClient } from "@/lib/supabase/server";

type MasterData = {
  lineMap: Map<string, string>; // line_code -> line_id
  shiftMap: Map<string, { id: string; started_at: string }>; // shift_name -> data
};

export async function resolveMasterData(orgId: string): Promise<MasterData> {
  const supabase = createSupabaseServerClient();

  // Load lines
  const { data: lines, error: lineError } = await supabase
    .from("lines")
    .select("id, line_code")
    .eq("org_id", orgId);

  if (lineError || !lines) {
    throw new Error("Failed to load lines");
  }

  // Load shifts
  const { data: shifts, error: shiftError } = await supabase
    .from("shifts")
    .select("id, shift_name, started_at")
    .eq("org_id", orgId);

  if (shiftError || !shifts) {
    throw new Error("Failed to load shifts");
  }

  const lineMap = new Map<string, string>();
  for (const l of lines) {
    lineMap.set(l.line_code, l.id);
  }

  const shiftMap = new Map<string, { id: string; started_at: string }>();
  for (const s of shifts) {
    shiftMap.set(s.shift_name, {
      id: s.id,
      started_at: s.started_at,
    });
  }

  return { lineMap, shiftMap };
}
