import { SupabaseClient } from "@supabase/supabase-js";

type LineRow = {
  id: string;
  name: string;
  org_id?: string;
};

export async function getLinesForOrg(
  supabase: SupabaseClient,
  orgId: string
) {
  const { data, error } = await supabase
    .from("lines")
    .select("id, name")
    .eq("org_id", orgId);

  if (error || !data) return [];

  return (data as LineRow[]).map((line) => ({
    id: line.id,
    name: line.name,
    status: "running",
  }));
}

export async function getLineById(
  supabase: SupabaseClient,
  lineId: string
) {
  const { data, error } = await supabase
    .from("lines")
    .select("id, name, org_id")
    .eq("id", lineId)
    .single();

  if (error || !data) return null;

  const line = data as LineRow;

  return {
    id: line.id,
    name: line.name,
    status: "running",
    outputPerHour: null,
    lastUpdate: null,
    orgId: line.org_id,
  };
}
