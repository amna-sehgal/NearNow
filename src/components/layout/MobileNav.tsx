'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Layers, Zap, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MobileNav() {
  const pathname = usePathname();
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('handle').eq('id', user.id).single();
      if (data) setHandle(data.handle);
    };
    load();
  }, []);

  const NAV = [
    { href: '/feed',                          icon: Activity, label: 'Feed'     },
    { href: '/projects',                      icon: Layers,   label: 'Projects' },
    { href: '/missions',                      icon: Zap,      label: 'Missions' },
    { href: '/search',                        icon: Search,   label: 'Search'   },
    { href: handle ? `/profile/${handle}` : '/feed', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{ background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
      <div className="flex items-center">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={label} href={href}
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