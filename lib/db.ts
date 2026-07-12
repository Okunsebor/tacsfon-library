/**
 * lib/db.ts
 *
 * Server-side Supabase client using the SERVICE ROLE key.
 *
 * SECURITY: This client bypasses Row Level Security (RLS) and must
 * NEVER be imported in client components or exposed to the browser.
 * Use only in:
 *   - /app/api/[...] route handlers
 *   - /app/actions.ts server actions
 *   - /features/[domain]/api/ server-side API modules
 *
 * The anon client (lib/supabaseClient.ts) is used for client-side operations
 * where RLS policies should apply.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('[db] NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!supabaseServiceKey) {
  console.warn(
    '[db] SUPABASE_SERVICE_ROLE_KEY is not set — ' +
    'falling back to anon key. RLS will apply to all server queries.'
  );
}

const key = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** Singleton server-side Supabase client (RLS bypassed via service role) */
export const db: SupabaseClient = createClient(supabaseUrl, key, {
  auth: {
    // Server client should not persist sessions
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'tacsfon-library-server',
    },
  },
});

/**
 * Execute a Supabase query and throw a typed error on failure.
 * Eliminates boilerplate `if (error) throw` in every route handler.
 */
export async function dbQuery<T>(
  query: PromiseLike<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message || 'Database error');
  }
  if (data === null) {
    throw new Error('No data returned from database');
  }
  return data;
}
