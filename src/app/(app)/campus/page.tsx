'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchCampusStats,
  fetchCampusBuilders,
  fetchCampusProjects,
  fetchCampusEvents,
  CampusStats,
  CampusEvent,
} from '@/lib/actions/campus';
import { UserProfile, ProjectFull, COLLEGES } from '@/lib/mock';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { MapPin, Users, Layers, Trophy, Calendar, ExternalLink, Star, ChevronRight } from 'lucide-react';

export default function CampusPage() {
  const [selectedCollege, setSelectedCollege] = useState<string>('All Campuses');
  const [stats, setStats] = useState<CampusStats | null>(null);
  const [builders, setBuilders] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<ProjectFull[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'builders' | 'projects' | 'events'>('leaderboard');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const [sData, bData, pData, eData] = await Promise.all([
        fetchCampusStats(selectedCollege),
        fetchCampusBuilders(selectedCollege),
        fetchCampusProjects(selectedCollege),
        fetchCampusEvents(selectedCollege),
      ]);
      if (isMounted) {
        setStats(sData);
        setBuilders(bData);
        setProjects(pData);
        setEvents(eData);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedCollege]);

  return (
    <div className="min-h-screen pb-16" style={{ background: '#0D0D0F' }}>
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center justify-between"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <div className="flex items-center gap-2">
          <MapPin size={18} style={{ color: '#C8F135' }} />
          <h1 className="font-display font-semibold text-base" style={{ color: '#E8E8F0' }}>
            Campus Network Map
          </h1>
        </div>
        <div className="font-mono text-xs px-2.5 py-1 rounded-full border"
          style={{ background: 'rgba(200,241,53,0.06)', borderColor: 'rgba(200,241,53,0.2)', color: '#C8F135' }}>
          {selectedCollege}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        {/* Hero Title */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: '#C8F135' }} />
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#7A7A8C' }}>
              Campus Ecosystem
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl" style={{ color: '#E8E8F0' }}>
            Discover Builders & Projects by College
          </h2>
          <p className="font-body text-sm mt-1 max-w-2xl" style={{ color: '#7A7A8C' }}>
            Explore campus statistics, builder leaderboards, live project showcases, and student hackathons across top Indian institutions.
          </p>
        </div>

        {/* College Selector Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {COLLEGES.map(c => {
            const active = selectedCollege === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCollege(c)}
                className="whitespace-nowrap px-4 py-2 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5"
                style={{
                  background: active ? 'rgba(200,241,53,0.12)' : '#141416',
                  color: active ? '#C8F135' : '#7A7A8C',
                  border: active ? '1px solid #C8F135' : '1px solid #2A2A30',
                }}
              >
                {c === 'All Campuses' ? '🌐' : '🎓'} {c}
              </button>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border flex flex-col gap-1" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Active Builders</span>
              <Users size={16} style={{ color: '#C8F135' }} />
            </div>
            <span className="font-display font-bold text-2xl" style={{ color: '#E8E8F0' }}>
              {loading ? '...' : (stats?.activeBuilders.toLocaleString() || '0')}
            </span>
            <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>In campus network</span>
          </div>

          <div className="p-4 rounded-2xl border flex flex-col gap-1" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Live Projects</span>
              <Layers size={16} style={{ color: '#C8F135' }} />
            </div>
            <span className="font-display font-bold text-2xl" style={{ color: '#E8E8F0' }}>
              {loading ? '...' : (stats?.liveProjects.toLocaleString() || '0')}
            </span>
            <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>Build Together</span>
          </div>

          <div className="p-4 rounded-2xl border flex flex-col gap-1" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Hackathon Teams</span>
              <Trophy size={16} style={{ color: '#C8F135' }} />
            </div>
            <span className="font-display font-bold text-2xl" style={{ color: '#E8E8F0' }}>
              {loading ? '...' : (stats?.hackathonTeams.toLocaleString() || '0')}
            </span>
            <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>Competing now</span>
          </div>

          <div className="p-4 rounded-2xl border flex flex-col gap-1" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Campus Rep & XP</span>
              <Star size={16} style={{ color: '#C8F135' }} />
            </div>
            <span className="font-display font-bold text-2xl" style={{ color: '#C8F135' }}>
              {loading ? '...' : (stats?.totalReputation.toLocaleString() || '0')}
            </span>
            <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>Aggregated score</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b gap-6" style={{ borderColor: '#2A2A30' }}>
          {[
            { id: 'leaderboard', label: '🏆 Campus Leaderboard' },
            { id: 'builders', label: '👤 Students & Builders' },
            { id: 'projects', label: '🚀 Campus Projects' },
            { id: 'events', label: '📅 Events & Hackathons' },
          ].map(t => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as 'leaderboard' | 'builders' | 'projects' | 'events')}
                className="pb-3 font-display font-medium text-sm transition-all border-b-2"
                style={{
                  color: active ? '#C8F135' : '#7A7A8C',
                  borderColor: active ? '#C8F135' : 'transparent',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-16 text-center font-mono text-sm" style={{ color: '#7A7A8C' }}>
            Loading campus network data...
          </div>
        ) : (
          <>
            {/* 1. Leaderboard */}
            {activeTab === 'leaderboard' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-semibold text-lg" style={{ color: '#E8E8F0' }}>
                    Top Builders ({selectedCollege})
                  </h3>
                  <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Ranked by Reputation & XP</span>
                </div>

                {builders.slice(0, 10).map((b, idx) => {
                  const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                  return (
                    <div
                      key={b.handle}
                      className="card-hover flex items-center gap-4 p-4 rounded-xl border"
                      style={{ background: '#141416', borderColor: '#2A2A30' }}
                    >
                      <div className="w-8 text-center font-mono font-bold text-base"
                        style={{ color: idx < 3 ? '#C8F135' : '#7A7A8C' }}>
                        {rankBadge}
                      </div>

                      <Avatar initials={b.avatar || b.name.slice(0, 2).toUpperCase()} size="md" glow={idx === 0} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${b.handle}`} className="font-display font-medium text-sm hover:underline" style={{ color: '#E8E8F0' }}>
                            {b.name}
                          </Link>
                          <span className="font-mono text-xs" style={{ color: '#C8F135' }}>@{b.handle}</span>
                        </div>
                        <p className="font-body text-xs truncate" style={{ color: '#7A7A8C' }}>
                          {b.college} · {b.year}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {b.skills?.slice(0, 3).map(s => <Tag key={s} label={s} variant="dim" />)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-display font-bold text-base" style={{ color: '#C8F135' }}>
                            {b.reputation} <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>REP</span>
                          </div>
                          <div className="font-mono text-xs" style={{ color: '#7A7A8C' }}>
                            {b.xp} XP
                          </div>
                        </div>

                        <Link
                          href={`/profile/${b.handle}`}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all"
                          style={{ borderColor: '#2A2A30', background: '#1C1C20', color: '#E8E8F0' }}
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Students & Builders */}
            {activeTab === 'builders' && (
              <div className="grid md:grid-cols-2 gap-4">
                {builders.map(b => (
                  <div
                    key={b.handle}
                    className="card-hover p-5 rounded-2xl border flex flex-col justify-between"
                    style={{ background: '#141416', borderColor: '#2A2A30' }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar initials={b.avatar || b.name.slice(0, 2).toUpperCase()} size="md" />
                          <div>
                            <Link href={`/profile/${b.handle}`} className="font-display font-semibold text-base hover:underline" style={{ color: '#E8E8F0' }}>
                              {b.name}
                            </Link>
                            <div className="font-mono text-xs" style={{ color: '#C8F135' }}>@{b.handle}</div>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded-full border font-mono text-xs"
                          style={{ background: 'rgba(200,241,53,0.06)', borderColor: 'rgba(200,241,53,0.2)', color: '#C8F135' }}>
                          ★ {b.reputation}
                        </div>
                      </div>

                      <p className="font-body text-xs mb-3" style={{ color: '#7A7A8C' }}>
                        🎓 {b.college} ({b.year})
                      </p>
                      {b.bio && <p className="font-body text-xs mb-4 line-clamp-2" style={{ color: '#E8E8F0' }}>{b.bio}</p>}

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {b.skills?.map(s => <Tag key={s} label={s} />)}
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: '#2A2A30' }}>
                      <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>{b.xp} total XP</span>
                      <Link
                        href={`/profile/${b.handle}`}
                        className="font-display font-medium text-xs px-3 py-1.5 rounded-lg border transition-all"
                        style={{ background: '#1C1C20', borderColor: '#2A2A30', color: '#E8E8F0' }}
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Campus Projects */}
            {activeTab === 'projects' && (
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map(p => (
                  <div
                    key={p.id}
                    className="card-hover p-5 rounded-2xl border flex flex-col justify-between"
                    style={{ background: '#141416', borderColor: '#2A2A30' }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Link href={`/projects/${p.id}`} className="font-display font-bold text-lg hover:underline" style={{ color: '#E8E8F0' }}>
                          {p.name}
                        </Link>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.15)' }}>
                          {p.status}
                        </span>
                      </div>

                      <p className="font-body text-xs mb-3" style={{ color: '#7A7A8C' }}>{p.tagline}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {p.stack?.map(s => <Tag key={s} label={s} />)}
                      </div>

                      <div className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>
                        🎓 Origin: <span style={{ color: '#E8E8F0' }}>{p.college}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: '#2A2A30' }}>
                      <span className="font-mono text-xs" style={{ color: '#C8F135' }}>
                        {p.openRoles?.filter(r => !r.filled).length || 0} open roles
                      </span>
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-display font-medium text-xs px-3.5 py-1.5 rounded-lg transition-all"
                        style={{ background: '#C8F135', color: '#0D0D0F' }}
                      >
                        Project Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Events & Hackathons */}
            {activeTab === 'events' && (
              <div className="flex flex-col gap-4">
                {events.map(ev => (
                  <div
                    key={ev.id}
                    className="card-hover p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
                    style={{ background: '#141416', borderColor: '#2A2A30' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-xl border"
                        style={{ background: 'rgba(200,241,53,0.08)', borderColor: 'rgba(200,241,53,0.2)', color: '#C8F135' }}>
                        <Calendar size={20} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-display font-bold text-base" style={{ color: '#E8E8F0' }}>{ev.title}</h4>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                            style={{ background: '#1C1C20', borderColor: '#2A2A30', color: '#C8F135' }}>
                            {ev.type}
                          </span>
                        </div>
                        <p className="font-body text-xs" style={{ color: '#7A7A8C' }}>
                          Hosted by {ev.organizer} · 🎓 {ev.college}
                        </p>
                        <p className="font-mono text-xs mt-1" style={{ color: '#E8E8F0' }}>
                          📍 {ev.location} | 🗓️ {ev.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0" style={{ borderColor: '#2A2A30' }}>
                      <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>
                        {ev.attendeesCount} builders registered
                      </span>
                      {ev.link && (
                        <a
                          href={ev.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-display font-medium text-xs px-4 py-2 rounded-xl transition-all"
                          style={{ background: '#C8F135', color: '#0D0D0F' }}
                        >
                          Register <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
