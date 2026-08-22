'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/actions/auth';
import { LogOut } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name?: string; handle?: string; avatar?: string } | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    async function checkUser() {
      try {
        // 1. Try server action getCurrentUser() (checks server cookies)
        const currentUser = await getCurrentUser();
        if (currentUser?.profile) {
          setUser(currentUser.profile);
          return;
        }

        // 2. Try browser client
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, handle, avatar')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            setUser(profile);
          } else {
            setUser({
              name: authUser.user_metadata?.name || 'Builder',
              handle: authUser.email?.split('@')[0] || 'builder',
              avatar: 'SB',
            });
          }
        }
      } catch {
        setUser(null);
      }
    }
    checkUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(13,13,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(42,42,48,0.8)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-2 h-2 rounded-full pulse-dot"
            style={{ background: '#C8F135' }}
          />
          <span className="font-display font-semibold text-[#E8E8F0] text-lg tracking-tight group-hover:text-white transition-colors">
            near<span style={{ color: '#C8F135' }}>now</span>
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/feed"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200"
                style={{ background: '#141416', borderColor: '#2A2A30', color: '#E8E8F0' }}
              >
                <Avatar initials={user.avatar || 'SB'} size="sm" />
                <span className="font-mono text-xs" style={{ color: '#C8F135' }}>
                  @{user.handle}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="flex items-center gap-1.5 font-body text-xs text-[#7A7A8C] hover:text-[#E8E8F0] transition-colors px-2.5 py-1.5 rounded-lg border border-transparent hover:border-[#2A2A30]"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth"
                className="font-body text-sm text-[#7A7A8C] hover:text-[#E8E8F0] transition-colors px-3 py-1.5"
              >
                Sign in
              </Link>
              <Link
                href="/auth?mode=join"
                className="font-display text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: '#C8F135',
                  color: '#0D0D0F',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.background = '#d4f547';
                  (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.background = '#C8F135';
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Join →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
