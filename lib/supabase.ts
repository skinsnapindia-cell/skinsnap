import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client. SERVER-ONLY — never import this into a client component.
 *
 * It uses the SERVICE ROLE key, which bypasses Row Level Security. Leaking it
 * to the browser would expose every customer's address, so it deliberately has
 * no NEXT_PUBLIC_ prefix (Next.js only ships NEXT_PUBLIC_* vars to the client).
 *
 * Configure via .env.local:
 *   SUPABASE_URL=https://xxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;

  client = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  return client;
}
