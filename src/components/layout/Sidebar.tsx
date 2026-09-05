'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Layers, Zap, Bell, Search, ChevronRight, LogOut } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useProfile } from '@/lib/supabase/hooks';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/feed',          icon: Activity, label: 'Feed'          },
  { href: '/projects',      icon: Layers,   label: 'Projects'      },
  { href: '/missions',      icon: Zap,      label: 'Missions'      },
  { href: '/search',        icon: Search,   label: 'Search'        },
];

export default function Sidebar({ userId }: { userId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

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
              style={{ background: active ? 'rgba(200,241,53,0.08)' : 'transparent', color: active ? '#C8F135' : '#7A7A8C', borderLeft: active ? '2px solid #C8F135' : '2px solid transparent' }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#E8E8F0'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; }}}
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

        <button onClick={handleSignOut}
          className="flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-all duration-150 w-full text-left mt-auto"
          style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#ff6b6b'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </nav>

      {/* User card */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: '#2A2A30' }}>
        {profile && (
          <>
            <div className="mb-3 px-2">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>XP</span>
                <span className="font-mono text-[10px]" style={{ color: '#C8F135' }}>{profile.xp} / {profile.xp_to_next}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1C1C20' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((profile.xp / profile.xp_to_next) * 100, 100)}%`, background: 'linear-gradient(to right, #9BB82A, #C8F135)' }} />
              </div>
            </div>
            <Link href={`/profile/${profile.handle}`}
              className="flex items-center gap-3 p-2 rounded-xl transition-all duration-150 group"
              style={{ background: '#141416', border: '1px solid #2A2A30' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A3A44'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; }}
            >
              <Avatar initials={profile.avatar || profile.name?.slice(0, 2).toUpperCase() || 'NN'} size="sm" glow />
              <div className="flex-1 min-w-0">
                <div className="font-display font-medium text-xs truncate" style={{ color: '#E8E8F0' }}>{profile.name}</div>
                <div className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>Rep {profile.reputation}</div>
              </div>
              <ChevronRight size={12} style={{ color: '#3A3A46' }} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}