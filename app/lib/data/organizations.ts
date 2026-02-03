import { createSupabaseServerClient } from "@/lib/supabase/server";

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
