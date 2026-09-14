import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, '');

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware/proxy refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Server-only administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * NEVER falls back to public anon key. Throws a clear configuration error if service role key is missing.
 */
export async function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  const serviceRoleKey = rawServiceKey.trim().replace(/^["']|["']$/g, '');

  if (!serviceRoleKey) {
    throw new Error(
      '[Supabase Admin Configuration Error]: SUPABASE_SERVICE_ROLE_KEY environment variable is missing. Server-side admin functions (such as atomic XP awarding) require SUPABASE_SERVICE_ROLE_KEY in .env.local.'
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
