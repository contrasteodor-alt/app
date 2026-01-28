import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOrganization(orgId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) throw error;
  return data;
}
