// src/app/(app)/missions/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchMissions, Mission } from '@/lib/actions/missions';
import Tag from '@/components/ui/Tag';
import { Zap, CheckCircle2, Clock, Award, ChevronRight, Loader2 } from 'lucide-react';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'AI / ML', 'DevOps', 'Open Source'];

export default function MissionsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchMissions(activeCategory);
        if (isMounted) setMissions(data);
      } catch (err) {
        console.error('[MissionsPage Error]:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [activeCategory]);

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      {/* Header bar */}
      <header
        className="sticky top-0 z-20 border-b px-4 md:px-8"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={18} style={{ color: '#C8F135' }} />
            <h1 className="font-display font-bold text-base" style={{ color: '#E8E8F0' }}>Skill Missions</h1>
          </div>
          <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Earn XP & Prove Skills</span>
        </div>

        {/* Category tabs */}
        <div className="pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="h-7 px-3 rounded-full font-mono text-xs whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: activeCategory === cat ? 'rgba(200,241,53,0.12)' : '#141416',
                border: `1px solid ${activeCategory === cat ? 'rgba(200,241,53,0.4)' : '#2A2A30'}`,
                color: activeCategory === cat ? '#C8F135' : '#7A7A8C',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* Banner */}
        <div className="rounded-2xl border p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(200,241,53,0.08), #141416 70%)', borderColor: 'rgba(200,241,53,0.2)' }}
        >
          <div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(200,241,53,0.15)', color: '#C8F135' }}>
              VERIFIED REPUTATION
            </span>
            <h2 className="font-display font-bold text-xl mt-2 mb-1" style={{ color: '#E8E8F0' }}>
              Complete Real Engineering Challenges
            </h2>
            <p className="font-body text-xs max-w-xl" style={{ color: '#7A7A8C' }}>
              Each completed mission builds your proof-of-work on NearNow, updates your profile XP, and broadcasts live to potential co-founders.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center px-4 py-2 rounded-xl border" style={{ background: '#1C1C20', borderColor: '#2A2A30' }}>
              <span className="font-display font-bold text-lg block" style={{ color: '#C8F135' }}>+{missions.reduce((acc, m) => acc + m.xp, 0)} XP</span>
              <span className="font-mono text-[9px]" style={{ color: '#7A7A8C' }}>Available XP</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="animate-spin" style={{ color: '#C8F135' }} />
            <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Loading skill missions...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {missions.map(m => (
              <Link
                key={m.id}
                href={`/missions/${m.id}`}
                className="card-hover flex flex-col p-5 rounded-xl border group transition-all duration-200"
                style={{
                  background: '#141416',
                  borderColor: m.isCompletedByCurrentUser ? 'rgba(200,241,53,0.3)' : '#2A2A30',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#1C1C20', color: '#7A7A8C', border: '1px solid #2A2A30' }}>
                        {m.category}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(200,241,53,0.06)', color: '#9BB82A' }}>
                        {m.difficulty}
                      </span>
                      {m.isCompletedByCurrentUser && (
                        <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(200,241,53,0.15)', color: '#C8F135' }}>
                          <CheckCircle2 size={10} /> Completed
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-base" style={{ color: '#E8E8F0' }}>{m.title}</h3>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <span className="font-display font-bold text-base block" style={{ color: '#C8F135' }}>+{m.xp}</span>
                    <span className="font-mono text-[9px]" style={{ color: '#7A7A8C' }}>XP</span>
                  </div>
                </div>

                <p className="font-body text-xs mb-4 line-clamp-2" style={{ color: '#7A7A8C' }}>{m.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {m.skills.map(s => <Tag key={s} label={s} />)}
                </div>

                <div className="mt-auto pt-3 border-t flex items-center justify-between" style={{ borderColor: '#2A2A30' }}>
                  <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: '#7A7A8C' }}>
                    <Clock size={11} /> {m.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1 font-display font-medium text-xs group-hover:translate-x-0.5 transition-transform" style={{ color: '#C8F135' }}>
                    {m.isCompletedByCurrentUser ? 'View Submission' : 'Start Mission'} <ChevronRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
