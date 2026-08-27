// src/components/layout/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Layers, Zap, Bell, User, Search, ChevronRight } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const NAV = [
  { href: '/feed',         icon: Activity, label: 'Feed'        },
  { href: '/projects',     icon: Layers,   label: 'Projects'    },
  { href: '/missions',     icon: Zap,      label: 'Missions'    },
  { href: '/search',       icon: Search,   label: 'Search'      },
  { href: '/notifications',icon: Bell,     label: 'Notifications' },
];

// Simulated current user — swap with real auth later
const ME = { name: 'Amna Sehgal', handle: 'amna_s', avatar: 'AS', xp: 1240, reputation: 842 };

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 border-r z-30"
      style={{ background: '#0D0D0F', borderColor: '#2A2A30' }}
    >
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
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-all duration-150"
              style={{
                background: active ? 'rgba(200,241,53,0.08)' : 'transparent',
                color: active ? '#C8F135' : '#7A7A8C',
                borderLeft: active ? '2px solid #C8F135' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#E8E8F0'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; }}}
            >
              <Icon size={16} />
              {label}
              {label === 'Notifications' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#C8F135' }} />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3 border-t" style={{ borderColor: '#2A2A30' }} />

        {/* Quick create */}
        <Link
          href="/projects/create"
          className="flex items-center gap-3 h-10 px-3 rounded-lg font-body text-sm transition-all duration-150"
          style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#141416'; e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <Layers size={16} />
          New Project
        </Link>
      </nav>

      {/* User mini card */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: '#2A2A30' }}>
        {/* XP bar */}
        <div className="mb-3 px-2">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>XP</span>
            <span className="font-mono text-[10px]" style={{ color: '#C8F135' }}>{ME.xp} / 1500</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1C1C20' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(ME.xp / 1500) * 100}%`, background: 'linear-gradient(to right, #9BB82A, #C8F135)' }}
            />
          </div>
        </div>

        <Link
          href={`/profile/${ME.handle}`}
          className="flex items-center gap-3 p-2 rounded-xl transition-all duration-150 group"
          style={{ background: '#141416', border: '1px solid #2A2A30' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A3A44'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; }}
        >
          <Avatar initials={ME.avatar} size="sm" glow />
          <div className="flex-1 min-w-0">
            <div className="font-display font-medium text-xs truncate" style={{ color: '#E8E8F0' }}>{ME.name}</div>
            <div className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>Rep {ME.reputation}</div>
          </div>
          <ChevronRight size={12} style={{ color: '#3A3A46' }} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
}