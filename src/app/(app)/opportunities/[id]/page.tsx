// src/app/(app)/opportunities/[id]/page.tsx
'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchOpportunityById, Opportunity } from '@/lib/actions/opportunities';
import Tag from '@/components/ui/Tag';
import { ArrowLeft, Compass, Calendar, MapPin, ExternalLink, Loader2 } from 'lucide-react';

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchOpportunityById(id);
        if (isMounted) setOpportunity(data);
      } catch (err) {
        console.error('[OpportunityDetail Error]:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3" style={{ background: '#0D0D0F' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#C8F135' }} />
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Loading opportunity...</span>
      </div>
    );
  }

  if (!opportunity) {
    notFound();
  }

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header
        className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center gap-4"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <Link href="/opportunities" className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Opportunities
        </Link>
        <span style={{ color: '#2A2A30' }}>·</span>
        <span className="font-mono text-xs truncate" style={{ color: '#7A7A8C' }}>{opportunity.title}</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {/* HERO */}
        <div className="rounded-2xl border p-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full mb-2 inline-block" style={{ background: 'rgba(200,241,53,0.08)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.2)' }}>
                {opportunity.type}
              </span>
              <h1 className="font-display font-bold text-2xl" style={{ color: '#E8E8F0' }}>{opportunity.title}</h1>
              <p className="font-mono text-sm mt-1" style={{ color: '#7A7A8C' }}>{opportunity.companyOrOrg}</p>
            </div>
            {opportunity.stipendOrPrize && (
              <div className="flex-shrink-0 text-center">
                <div className="font-display font-bold text-xl" style={{ color: '#C8F135' }}>{opportunity.stipendOrPrize}</div>
                <div className="font-mono text-[9px]" style={{ color: '#7A7A8C' }}>Reward / Stipend</div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono mb-6 pb-6 border-b" style={{ borderColor: '#2A2A30', color: '#7A7A8C' }}>
            <span className="flex items-center gap-1.5"><MapPin size={13} /> {opportunity.location}</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} /> Deadline: {opportunity.deadline}</span>
          </div>

          <p className="font-body text-sm leading-relaxed mb-6" style={{ color: '#E8E8F0' }}>{opportunity.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {opportunity.tags.map(t => <Tag key={t} label={t} variant="dim" />)}
          </div>

          <a
            href={opportunity.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full h-12 rounded-xl font-display font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{ background: '#C8F135', color: '#0D0D0F' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
          >
            Apply Now <ExternalLink size={15} />
          </a>
        </div>
      </main>
    </div>
  );
}
