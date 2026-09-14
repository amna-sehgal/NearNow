'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Layers, Users, Bell, User, MapPin, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MobileNav() {
  const pathname = usePathname();
  const [handle, setHandle] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('handle')
        .eq('id', user.id)
        .single();
      if (data) setHandle(data.handle);

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnread(count || 0);
    };
    load();
  }, []);

  const NAV = [
    { href: '/feed',                                  icon: Activity,      label: 'Feed'        },
    { href: '/projects',                              icon: Layers,        label: 'Projects'    },
    { href: '/campus',                                icon: MapPin,        label: 'Campus'      },
    { href: '/communities',                           icon: MessageSquare, label: 'Communities' },
    { href: '/match',                                 icon: Users,         label: 'Match'       },
    { href: '/notifications',                         icon: Bell,          label: 'Alerts', badge: unread },
    { href: handle ? `/profile/${handle}` : '/feed',  icon: User,          label: 'Profile'     },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{ background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
      <div className="flex items-center">
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={label} href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all relative"
              style={{ color: active ? '#C8F135' : '#3A3A46' }}
            >
              <div className="relative">
                <Icon size={18} />
                {badge && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono text-[8px]"
                    style={{ background: '#C8F135', color: '#0D0D0F' }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="font-mono text-[9px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}