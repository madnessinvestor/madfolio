import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: "public",
    },
  });
}

export { supabase };

export async function initializeSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[Supabase] No credentials found, skipping connection");
    return false;
  }

  try {
    const { data, error } = await supabase!
      .from("users")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Supabase connection error:", error);
      throw error;
    }

    console.log("✓ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    throw error;
  }
}
