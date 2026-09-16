'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Layers, Zap, Search, ChevronRight, LogOut, User, Users, Bell } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/components/providers/AuthProvider';

const NAV = [
  { href: '/feed', icon: Activity, label: 'Feed' },
  { href: '/projects', icon: Layers, label: 'Projects' },
  { href: '/match', icon: Users, label: 'Match' },
  { href: '/missions', icon: Zap, label: 'Missions' },
  { href: '/search', icon: Search, label: 'Search' },
];
export default function Sidebar({ userId }: { userId: string }) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const xpPercent = profile ? Math.min((profile.xp / profile.xp_to_next) * 100, 100) : 0;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const loadUnread = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      setUnreadCount(count || 0);
    };
    loadUnread();

    const supabase = createClient();
    const channel = supabase
      .channel('notif-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => loadUnread())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 border-r z-30"
      style={{ background: '#0D0D0F', borderColor: '#2A2A30' }}>

      {/* Wordmark */}
      <div className="px-5 h-14 flex items-center border-b" style={{ borderColor: '#2A2A30' }}>
        <Link href="/feed" className="flex items-center gap-2">
          <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
          <span className="font-display font-semibold text-base" style={{ color: '#E8E8F0' }}>
            near<span style={{ color: '#C8F135' }}>now</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-all duration-150"
              style={{
                background: active ? 'rgba(200,241,53,0.08)' : 'transparent',
                color: active ? '#C8F135' : '#7A7A8C',
                borderLeft: active ? '2px solid #C8F135' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#E8E8F0'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; } }}
            >
              <Icon size={16} />{label}
            </Link>
          );
        })}

        <div className="my-3 border-t" style={{ borderColor: '#2A2A30' }} />

        <Link href="/projects/create"
          className="flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-all duration-150"
          style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <Layers size={16} /> New Project
        </Link>

        <Link
          href="/notifications"
          className="flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-all duration-150"
          style={{
            background: pathname === '/notifications' ? 'rgba(200,241,53,0.08)' : 'transparent',
            color: pathname === '/notifications' ? '#C8F135' : '#7A7A8C',
            borderLeft: pathname === '/notifications' ? '2px solid #C8F135' : '2px solid transparent',
          }}
          onMouseEnter={e => { if (pathname !== '/notifications') { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#E8E8F0'; } }}
          onMouseLeave={e => { if (pathname !== '/notifications') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; } }}
        >
          <Bell size={16} />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(200,241,53,0.15)', color: '#C8F135' }}>
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Profile link — always visible */}
        <Link
          href={profile ? `/profile/${profile.handle}` : '/profile/me'}
          className="flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-all duration-150"
          style={{
            background: pathname.startsWith('/profile') ? 'rgba(200,241,53,0.08)' : 'transparent',
            color: pathname.startsWith('/profile') ? '#C8F135' : '#7A7A8C',
            borderLeft: pathname.startsWith('/profile') ? '2px solid #C8F135' : '2px solid transparent',
          }}
          onMouseEnter={e => { if (!pathname.startsWith('/profile')) { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#E8E8F0'; } }}
          onMouseLeave={e => { if (!pathname.startsWith('/profile')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; } }}
        >
          <User size={16} /> Profile
        </Link>
      </nav>

      {/* User card at bottom */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: '#2A2A30' }}>
        {profile ? (
          <>
            {/* XP bar */}
            <div className="mb-3 px-2">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>XP</span>
                <span className="font-mono text-[10px]" style={{ color: '#C8F135' }}>{profile.xp} / {profile.xp_to_next}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1C1C20' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${xpPercent}%`, background: 'linear-gradient(to right, #9BB82A, #C8F135)' }} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/profile/${user.handle}`}
                className="flex items-center gap-3 p-2 rounded-xl transition-all duration-150 group"
                style={{ background: '#141416', border: '1px solid #2A2A30' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A3A44'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; }}
              >
                <Avatar initials={user.avatar} size="sm" glow />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-medium text-xs truncate" style={{ color: '#E8E8F0' }}>{user.name}</div>
                  <div className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>@{user.handle} · Rep {user.reputation}</div>
                </div>
                <ChevronRight size={12} style={{ color: '#3A3A46' }} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button
                onClick={signOut}
                className="flex items-center justify-center gap-1.5 h-8 w-full rounded-lg font-body text-xs transition-colors"
                style={{ color: '#7A7A8C', background: '#141416', border: '1px solid #2A2A30' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; e.currentTarget.style.borderColor = '#3A3A44'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; e.currentTarget.style.borderColor = '#2A2A30'; }}
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          </>
        ) : !loading && !user ? (
          <div className="p-3 rounded-xl border text-center" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <p className="font-display font-medium text-xs mb-2" style={{ color: '#E8E8F0' }}>Sign in to track XP & build</p>
            <Link
              href="/auth"
              className="flex items-center justify-center gap-1.5 h-8 w-full rounded-lg font-display font-semibold text-xs transition-all"
              style={{ background: '#C8F135', color: '#0D0D0F' }}
            >
              <Avatar
                initials={profile.avatar || profile.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'NN'}
                size="sm" glow
              />
              <div className="flex-1 min-w-0">
                <div className="font-display font-medium text-xs truncate" style={{ color: '#E8E8F0' }}>{profile.name}</div>
                <div className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>Rep {profile.reputation} · @{profile.handle}</div>
              </div>
              <ChevronRight size={12} style={{ color: '#3A3A46' }} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </>
        ) : (
          /* Skeleton while loading */
          <div className="flex items-center gap-3 p-2 rounded-xl mb-2" style={{ background: '#141416', border: '1px solid #2A2A30' }}>
            <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: '#1C1C20' }} />
            <div className="flex-1">
              <div className="h-2.5 rounded animate-pulse mb-1.5" style={{ background: '#1C1C20', width: '70%' }} />
              <div className="h-2 rounded animate-pulse" style={{ background: '#1C1C20', width: '50%' }} />
            </div>
          </div>
        )}

        {/* Sign out */}
        <button onClick={handleSignOut}
          className="flex items-center gap-3 h-9 px-3 rounded-lg font-body text-sm transition-all w-full text-left"
          style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#ff6b6b'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}