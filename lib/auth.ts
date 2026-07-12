/**
 * lib/auth.ts
 *
 * Secure server-side authentication utility using @supabase/ssr.
 * Reads and validates Supabase JWT user sessions from browser cookies.
 *
 * This client is user-scoped and respects Row Level Security (RLS)
 * when querying tables directly.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from './db';

/**
 * Instantiate a user-scoped Supabase client for Server Actions and API Routes.
 * Cryptographically verifies user cookies.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Components
          }
        },
      },
    }
  );
}

/**
 * Helper to fetch the current authenticated user on the server.
 * Returns null if the user is unauthenticated or the session is expired.
 */
export async function getAuthenticatedUser() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Verify if the provided email is authenticated as an administrator.
 * Queries admin_settings using the admin database client (service role) securely on the server.
 */
export async function verifyAdminStatus(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  try {
    const { data, error } = await db
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_email')
      .single();

    if (error || !data) {
      return false;
    }

    return data.setting_value.toLowerCase().trim() === email.toLowerCase().trim();
  } catch {
    return false;
  }
}
