'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ActivityCard from '@/components/ui/ActivityCard';
import { Plus, Search, Zap, Trophy, Code2, Rocket, GitMerge } from 'lucide-react';

const FILTERS = [
  { key: 'all',              label: 'All'      },
  { key: 'earned_xp',       label: 'Missions', icon: Zap      },
  { key: 'won_hackathon',   label: 'Wins',     icon: Trophy   },
  { key: 'started_project', label: 'Projects', icon: Code2    },
  { key: 'deployed',        label: 'Deployed', icon: Rocket   },
  { key: 'contributed_oss', label: 'OSS',      icon: GitMerge },
];

export default function FeedPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      const supabase = createClient();
      let query = supabase
        .from('activities')
        .select(`*, profiles(name, handle, avatar, college)`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activeFilter !== 'all') query = query.eq('type', activeFilter);

      const { data } = await query;
      setActivities(data || []);
      setLoading(false);
    };

    fetchActivities();

    // Realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel('feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, payload => {
        setActivities(prev => [payload.new as any, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeFilter]);

  const filtered = activities.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.profiles?.name?.toLowerCase().includes(q) ||
      a.content?.toLowerCase().includes(q) ||
      a.tags?.some((t: string) => t.toLowerCase().includes(q))
    );
  });

  // Map DB row → ActivityCard shape
  const toCard = (a: any) => ({
    id: a.id,
    type: a.type,
    user: {
      name: a.profiles?.name || 'Builder',
      handle: a.profiles?.handle || 'user',
      avatar: a.profiles?.avatar || 'NN',
      college: a.profiles?.college || '',
    },
    content: a.content,
    meta: a.meta,
    tags: a.tags || [],
    xp: a.xp,
    timestamp: new Date(a.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
    isFresh: Date.now() - new Date(a.created_at).getTime() < 1000 * 60 * 30,
  });

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-40 border-b px-4 md:px-6"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <div className="max-w-2xl mx-auto h-14 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3A3A46' }} />
            <input type="text" placeholder="Search builders, projects, skills..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-4 rounded-lg font-body text-sm outline-none transition-all"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <Link href="/feed/create"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg font-display font-medium text-sm flex-shrink-0 transition-all"
            style={{ background: '#C8F135', color: '#0D0D0F' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
          >
            <Plus size={14} /><span className="hidden sm:inline">Post</span>
          </Link>
        </div>
        <div className="max-w-2xl mx-auto pb-3 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(f => {
            const Icon = f.icon;
            const isActive = activeFilter === f.key;
            return (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                className="flex items-center gap-1.5 h-7 px-3 rounded-full font-mono text-xs whitespace-nowrap transition-all flex-shrink-0"
                style={{ background: isActive ? 'rgba(200,241,53,0.12)' : '#141416', border: `1px solid ${isActive ? 'rgba(200,241,53,0.4)' : '#2A2A30'}`, color: isActive ? '#C8F135' : '#7A7A8C' }}
              >
                {Icon && <Icon size={10} />}{f.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
          <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>
            {loading ? 'Loading...' : `${filtered.length} activities · live`}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 rounded-xl border animate-pulse" style={{ background: '#141416', borderColor: '#2A2A30' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-lg" style={{ color: '#3A3A46' }}>
              {activities.length === 0 ? 'No activity yet.' : 'Nothing matches.'}
            </p>
            <p className="font-body text-sm mt-1" style={{ color: '#3A3A46' }}>
              {activities.length === 0 ? 'Be the first to post something.' : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((a, i) => (
              <div key={a.id} style={{ animation: `float-up 0.5s ease forwards`, animationDelay: `${i * 40}ms`, opacity: 0 }}>
                <Link href={`/feed/${a.id}`}>
                  <ActivityCard activity={toCard(a)} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}