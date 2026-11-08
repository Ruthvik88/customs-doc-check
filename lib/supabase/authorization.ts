import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type AppRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return error || !data ? null : data.role;
}
