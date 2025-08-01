import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Read environment variables injected by Vite.  These must be defined in
// `.env.local` for development.  See `.env.example` for the expected values.
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create a single Supabase client for the entire application.  The generic
// parameter ties together the generated types from `supabase-types.ts` with
// your queries for end‑to‑end type safety.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// This file centralises the Supabase client creation.  Whenever you need to
// interact with your database, import `supabase` from this file.