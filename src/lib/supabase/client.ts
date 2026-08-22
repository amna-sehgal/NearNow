import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, '');

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
