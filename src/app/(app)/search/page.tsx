'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { Search, Users, Layers, Zap, Star } from 'lucide-react';

const TABS = [
  { key: 'people',       label: 'People',       icon: Users  },
  { key: 'projects',     label: 'Projects',     icon: Layers },
  { key: 'missions',     label: 'Missions',     icon: Zap    },
  { key: 'opportunities',label: 'Opportunities',icon: Star   },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('people');
  const [results, setResults] = useState<Record<string, any[]>>({
    people: [], projects: [], missions: [], opportunities: [],
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ people: [], projects: [], missions: [], opportunities: [] });
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const supabase = createClient();
    const term = q.trim().toLowerCase();

    const [people, projects, missions, opportunities] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${term}%,handle.ilike.%${term}%,college.ilike.%${term}%,bio.ilike.%${term}%`)
        .limit(20),
      supabase
        .from('projects')
        .select('*')
        .or(`name.ilike.%${term}%,tagline.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`)
        .limit(20),
      supabase
        .from('missions')
        .select('*')
        .or(`title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`)
        .limit(20),
      supabase
        .from('opportunities')
        .select('*')
        .or(`title.ilike.%${term}%,description.ilike.%${term}%,company_or_org.ilike.%${term}%,type.ilike.%${term}%`)
        .limit(20),
    ]);

    setResults({
      people: people.data || [],
      projects: projects.data || [],
      missions: missions.data || [],
      opportunities: opportunities.data || [],
    });
    setLoading(false);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const totalResults = Object.values(results).reduce((a, b) => a + b.length, 0);
  const currentResults = results[tab] || [];

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-20 border-b px-4 md:px-8"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <div className="h-14 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3A3A46' }} />
            <input
              autoFocus
              type="text"
              placeholder="Search people, projects, missions, opportunities..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl font-body text-sm outline-none transition-all"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
              onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Tabs */}
        {searched && (
          <div className="pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const count = results[t.key]?.length || 0;
              const isActive = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-full font-mono text-xs whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    background: isActive ? 'rgba(200,241,53,0.12)' : '#141416',
                    border: `1px solid ${isActive ? 'rgba(200,241,53,0.4)' : '#2A2A30'}`,
                    color: isActive ? '#C8F135' : '#7A7A8C',
                  }}
                >
                  <Icon size={10} />
                  {t.label}
                  {count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full font-mono text-[9px]"
                      style={{ background: isActive ? 'rgba(200,241,53,0.2)' : '#1C1C20', color: isActive ? '#C8F135' : '#3A3A46' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-6">
        {/* Empty state */}
        {!searched && (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#141416', border: '1px solid #2A2A30' }}>
              <Search size={22} style={{ color: '#3A3A46' }} />
            </div>
            <p className="font-display text-base mb-2" style={{ color: '#3A3A46' }}>Search Near Now</p>
            <p className="font-body text-sm" style={{ color: '#3A3A46' }}>
              Find builders, projects, missions and opportunities
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['React', 'AI', 'DTU', 'Hackathon', 'Backend', 'Open Source'].map(s => (
                <button key={s} onClick={() => setQuery(s)}
                  className="font-mono text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{ background: '#141416', borderColor: '#2A2A30', color: '#7A7A8C' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-xl border animate-pulse" style={{ background: '#141416', borderColor: '#2A2A30' }} />
            ))}
          </div>
        )}

        {/* No results */}
        {searched && !loading && totalResults === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-base" style={{ color: '#3A3A46' }}>
              No results for &quot;{query}&quot;
            </p>
            <p className="font-body text-sm mt-1" style={{ color: '#3A3A46' }}>Try a different keyword</p>
          </div>
        )}

        {/* Results */}
        {searched && !loading && totalResults > 0 && (
          <div className="flex flex-col gap-3">
            {/* People */}
            {tab === 'people' && currentResults.map((person: any, i: number) => (
              <Link key={person.id} href={`/profile/${person.handle}`}
                className="card-hover flex items-center gap-4 p-4 rounded-xl border"
                style={{ background: '#141416', borderColor: '#2A2A30', animation: `float-up 0.4s ease forwards`, animationDelay: `${i * 40}ms`, opacity: 0 }}
              >
                <Avatar initials={person.avatar || person.name?.slice(0,2).toUpperCase() || 'NN'} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>{person.name}</span>
                    <span className="font-mono text-[10px]" style={{ color: '#C8F135' }}>@{person.handle}</span>
                  </div>
                  {person.college && (
                    <p className="font-body text-xs mb-1.5" style={{ color: '#7A7A8C' }}>{person.college} · {person.year}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {person.skills?.slice(0, 4).map((s: string) => <Tag key={s} label={s} />)}
                  </div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="font-display font-bold text-base" style={{ color: '#C8F135' }}>{person.reputation}</div>
                  <div className="font-mono text-[9px]" style={{ color: '#7A7A8C' }}>rep</div>
                </div>
              </Link>
            ))}

            {/* Projects */}
            {tab === 'projects' && currentResults.map((project: any, i: number) => (
              <Link key={project.id} href={`/projects/${project.id}`}
                className="card-hover flex flex-col p-4 rounded-xl border"
                style={{ background: '#141416', borderColor: '#2A2A30', animation: `float-up 0.4s ease forwards`, animationDelay: `${i * 40}ms`, opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>{project.name}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(200,241,53,0.08)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.15)' }}>
                    {project.status}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: '#3A3A46' }}>{project.category}</span>
                </div>
                <p className="font-body text-xs mb-2" style={{ color: '#7A7A8C' }}>{project.tagline}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack?.slice(0, 5).map((s: string) => <Tag key={s} label={s} />)}
                </div>
                {(project.open_roles || []).filter((r: any) => !r.filled).length > 0 && (
                  <p className="font-mono text-[10px] mt-2" style={{ color: '#C8F135' }}>
                    {(project.open_roles || []).filter((r: any) => !r.filled).length} open role(s)
                  </p>
                )}
              </Link>
            ))}

            {/* Missions */}
            {tab === 'missions' && currentResults.map((mission: any, i: number) => (
              <div key={mission.id}
                className="flex items-start gap-4 p-4 rounded-xl border"
                style={{ background: '#141416', borderColor: '#2A2A30', animation: `float-up 0.4s ease forwards`, animationDelay: `${i * 40}ms`, opacity: 0 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.15)' }}>
                  <Zap size={16} style={{ color: '#C8F135' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>{mission.title}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: '#1C1C20', color: '#7A7A8C', border: '1px solid #2A2A30' }}>
                      {mission.difficulty}
                    </span>
                  </div>
                  <p className="font-body text-xs mb-2" style={{ color: '#7A7A8C' }}>
                    {mission.description?.slice(0, 100)}...
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: '#C8F135' }}>+{mission.xp} XP</span>
                    <span className="font-mono text-[10px]" style={{ color: '#3A3A46' }}>{mission.category}</span>
                    <span className="font-mono text-[10px]" style={{ color: '#3A3A46' }}>{mission.estimated_time}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Opportunities */}
            {tab === 'opportunities' && currentResults.map((opp: any, i: number) => (
              <div key={opp.id}
                className="flex items-start gap-4 p-4 rounded-xl border"
                style={{ background: '#141416', borderColor: '#2A2A30', animation: `float-up 0.4s ease forwards`, animationDelay: `${i * 40}ms`, opacity: 0 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(155,184,42,0.08)', border: '1px solid rgba(155,184,42,0.15)' }}>
                  <Star size={16} style={{ color: '#9BB82A' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>{opp.title}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: '#1C1C20', color: '#9BB82A', border: '1px solid rgba(155,184,42,0.2)' }}>
                      {opp.type}
                    </span>
                  </div>
                  <p className="font-body text-xs mb-1" style={{ color: '#7A7A8C' }}>{opp.company_or_org}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {opp.deadline && <span className="font-mono text-[10px]" style={{ color: '#3A3A46' }}>Deadline: {opp.deadline}</span>}
                    {opp.stipend_or_prize && <span className="font-mono text-[10px]" style={{ color: '#C8F135' }}>{opp.stipend_or_prize}</span>}
                    {opp.apply_url && (
                      <a href={opp.apply_url} target="_blank" rel="noreferrer"
                        className="font-mono text-[10px] transition-colors"
                        style={{ color: '#7A7A8C' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C8F135'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
                        onClick={e => e.stopPropagation()}
                      >Apply →</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}