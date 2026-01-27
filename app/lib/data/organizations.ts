import { SupabaseClient } from "@supabase/supabase-js";

export async function getOrganizationById(
  supabase: SupabaseClient,
  orgId: string
) {
  const { data, error } = await supabase
    .from("organizations")
    .select("org_id, name, location")
    .eq("org_id", orgId)
    .single();

  if (error || !data) return null;

  return {
    id: data.org_id,
    name: data.name,
    location: data.location,
  };
}
