import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getOrganization(orgId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("org_id", orgId);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return data[0];
}

// --- ADDITION (needed for Overview / Areas)
export async function getPlantsForOrg(
  supabase: SupabaseClient,
  orgId: string
) {
  const { data, error } = await supabase
    .from("plants")
    .select("id, name")
    .eq("org_id", orgId)
    .order("name");

  if (error) throw error;

  return data;
}
