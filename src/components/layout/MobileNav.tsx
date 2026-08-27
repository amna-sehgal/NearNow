// src/components/layout/MobileNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Layers, Zap, Bell, User } from 'lucide-react';

const NAV = [
  { href: '/feed',          icon: Activity, label: 'Feed'     },
  { href: '/projects',      icon: Layers,   label: 'Projects' },
  { href: '/missions',      icon: Zap,      label: 'Missions' },
  { href: '/notifications', icon: Bell,     label: 'Alerts'   },
  { href: '/profile/amna_s',icon: User,     label: 'Profile'  },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{ background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
    >
      <div className="flex items-center">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
              style={{ color: active ? '#C8F135' : '#3A3A46' }}
            >
              <Icon size={18} />
              <span className="font-mono text-[9px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}