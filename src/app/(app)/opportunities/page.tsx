// src/app/(app)/opportunities/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchOpportunities, Opportunity } from '@/lib/actions/opportunities';
import Tag from '@/components/ui/Tag';
import { Compass, Search, Calendar, MapPin, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';

const TYPES = ['All', 'Hackathon', 'Grant', 'Bounty', 'Internship', 'Fellowship'];

export default function OpportunitiesPage() {
  const [activeType, setActiveType] = useState('All');
  const [search, setSearch] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchOpportunities({ type: activeType, search });
        if (isMounted) setOpportunities(data);
      } catch (err) {
        console.error('[OpportunitiesPage Error]:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [activeType, search]);

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b px-4 md:px-8"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <div className="h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2 flex-shrink-0">
            <Compass size={18} style={{ color: '#C8F135' }} />
            <h1 className="font-display font-bold text-base hidden sm:inline" style={{ color: '#E8E8F0' }}>Opportunity OS</h1>
          </div>
          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3A3A46' }} />
            <input
              type="text"
              placeholder="Search hackathons, grants, bounties, internships..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-4 rounded-lg font-body text-sm outline-none transition-all"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
              onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Type tabs */}
        <div className="pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className="h-7 px-3 rounded-full font-mono text-xs whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: activeType === t ? 'rgba(200,241,53,0.12)' : '#141416',
                border: `1px solid ${activeType === t ? 'rgba(200,241,53,0.4)' : '#2A2A30'}`,
                color: activeType === t ? '#C8F135' : '#7A7A8C',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>
            {opportunities.length} live opportunity{opportunities.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="animate-spin" style={{ color: '#C8F135' }} />
            <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Fetching opportunities...</span>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl p-8" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <p className="font-display text-lg" style={{ color: '#E8E8F0' }}>No opportunities found.</p>
            <p className="font-body text-sm mt-1" style={{ color: '#7A7A8C' }}>Try adjusting your search query or filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {opportunities.map(opp => (
              <Link
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="card-hover flex flex-col p-5 rounded-xl border group transition-all duration-200"
                style={{ background: '#141416', borderColor: '#2A2A30' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full mb-1.5 inline-block" style={{ background: 'rgba(200,241,53,0.08)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.2)' }}>
                      {opp.type}
                    </span>
                    <h3 className="font-display font-semibold text-base" style={{ color: '#E8E8F0' }}>{opp.title}</h3>
                    <p className="font-mono text-xs" style={{ color: '#7A7A8C' }}>{opp.companyOrOrg}</p>
                  </div>
                  {opp.stipendOrPrize && (
                    <div className="flex-shrink-0 text-right">
                      <span className="font-display font-bold text-xs px-2.5 py-1 rounded-lg block" style={{ background: '#1C1C20', color: '#C8F135', border: '1px solid #2A2A30' }}>
                        {opp.stipendOrPrize}
                      </span>
                    </div>
                  )}
                </div>

                <p className="font-body text-xs mb-4 line-clamp-2" style={{ color: '#7A7A8C' }}>{opp.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {opp.tags.map(t => <Tag key={t} label={t} />)}
                </div>

                <div className="mt-auto pt-3 border-t flex items-center justify-between font-mono text-[10px]" style={{ borderColor: '#2A2A30', color: '#7A7A8C' }}>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {opp.location}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> {opp.deadline}</span>
                  <span className="flex items-center gap-1 font-display text-xs group-hover:translate-x-0.5 transition-transform" style={{ color: '#C8F135' }}>
                    View <ChevronRight size={12} />
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
