// src/components/layout/MobileNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Layers, Zap, Compass, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const profileHref = user?.handle ? `/profile/${user.handle}` : '/auth';

  const NAV = [
    { href: '/feed',          icon: Activity, label: 'Feed'        },
    { href: '/projects',      icon: Layers,   label: 'Projects'    },
    { href: '/missions',      icon: Zap,      label: 'Missions'    },
    { href: '/opportunities', icon: Compass,  label: 'Opportunities'},
    { href: profileHref,      icon: User,     label: 'Profile'     },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{ background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
    >
      <div className="flex items-center">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/auth' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
              style={{ color: active ? '#C8F135' : '#3A3A46' }}
            >
              <Icon size={18} />
              <span className="font-mono text-[9px] truncate px-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}