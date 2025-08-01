import { createClient } from '@supabase/supabase-js';

// Read environment variables provided by Vite.  See `.env.example` for the
// expected values.  The Supabase URL points at your project and the anon key
// authorises requests with row‑level security applied.
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Initialise a typed Supabase client.  The auth configuration enables
// persistent sessions and automatic token refreshes.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});