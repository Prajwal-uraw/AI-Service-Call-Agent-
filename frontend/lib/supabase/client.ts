import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Return a client even if env vars are missing (for build time)
  // The client will fail at runtime if actually used without proper credentials
  return createBrowserClient(supabaseUrl, supabaseKey);
}
