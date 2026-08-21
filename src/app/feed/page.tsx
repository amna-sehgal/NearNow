'use client';
import { useState } from 'react';
import Link from 'next/link';
import ActivityCard from '@/components/ui/ActivityCard';
import { ACTIVITIES } from '@/lib/data';
import { Plus, Filter, Search, Zap, Trophy, Code2, Rocket, GitMerge } from 'lucide-react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'earned_xp', label: 'Missions', icon: Zap },
  { key: 'won_hackathon', label: 'Wins', icon: Trophy },
  { key: 'started_project', label: 'Projects', icon: Code2 },
  { key: 'deployed', label: 'Deployed', icon: Rocket },
  { key: 'contributed_oss', label: 'OSS', icon: GitMerge },
];

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ACTIVITIES.filter(a => {
    const matchesFilter = activeFilter === 'all' || a.type === activeFilter;
    const matchesSearch = !searchQuery || 
      a.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 border-b px-4 md:px-6"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <div className="max-w-2xl mx-auto h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 mr-2 flex-shrink-0">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
            <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>
              near<span style={{ color: '#C8F135' }}>now</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#3A3A46' }}
            />
            <input
              type="text"
              placeholder="Search builders, projects, skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-4 rounded-lg font-body text-sm outline-none transition-all duration-200"
              style={{
                background: '#141416',
                border: '1px solid #2A2A30',
                color: '#E8E8F0',
              }}
              onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Create post */}
          <Link
            href="/feed/create"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg font-display font-medium text-sm flex-shrink-0 transition-all duration-200"
            style={{ background: '#C8F135', color: '#0D0D0F' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Post</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="max-w-2xl mx-auto pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {FILTERS.map(f => {
            const Icon = f.icon;
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="flex items-center gap-1.5 h-7 px-3 rounded-full font-mono text-xs whitespace-nowrap transition-all duration-200 flex-shrink-0"
                style={{
                  background: isActive ? 'rgba(200,241,53,0.12)' : '#141416',
                  border: `1px solid ${isActive ? 'rgba(200,241,53,0.4)' : '#2A2A30'}`,
                  color: isActive ? '#C8F135' : '#7A7A8C',
                }}
              >
                {Icon && <Icon size={10} />}
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-5">
          <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
          <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>
            {filtered.length} activities · updating live
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-lg" style={{ color: '#3A3A46' }}>Nothing here yet.</p>
            <p className="font-body text-sm mt-1" style={{ color: '#3A3A46' }}>Try a different filter or search.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((activity, i) => (
              <div
                key={activity.id}
                className="transition-all duration-500"
                style={{
                  animation: `float-up 0.5s ease forwards`,
                  animationDelay: `${i * 50}ms`,
                  opacity: 0,
                }}
              >
                <Link href={`/feed/${activity.id}`} className="block">
                  <ActivityCard activity={activity} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
