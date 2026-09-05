// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/feed';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure profile row exists for OAuth user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          const email = user.email || '';
          const name = user.user_metadata?.full_name || user.user_metadata?.name || 'Builder';
          const handle = (user.user_metadata?.preferred_username || email.split('@')[0] || 'builder')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '');
          const avatar = user.user_metadata?.avatar_url || name.slice(0, 2).toUpperCase();

          await supabase.from('profiles').upsert({
            id: user.id,
            name,
            handle,
            avatar,
            github: user.user_metadata?.preferred_username || null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=OAuth%20authentication%20failed`);
}
