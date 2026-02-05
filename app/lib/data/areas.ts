import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAreasByPlant(plantId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("areas")
    .select("id, name")
    .eq("plant_id", plantId)
    .order("name");

  if (error) throw error;

  return data;
}
