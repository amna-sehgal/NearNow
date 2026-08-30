// src/app/(app)/missions/[id]/page.tsx
'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchMissionById, completeMissionAction, Mission } from '@/lib/actions/missions';
import Tag from '@/components/ui/Tag';
import { ArrowLeft, Zap, CheckCircle2, Clock, Award, Send, Loader2, AlertCircle } from 'lucide-react';

export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [earnedXp, setEarnedXp] = useState(100);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const m = await fetchMissionById(id);
        if (isMounted) {
          setMission(m);
          if (m?.isCompletedByCurrentUser) setCompleted(true);
        }
      } catch (err) {
        console.error('[MissionDetail Error]:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  const handleSubmit = async () => {
    if (!submissionUrl.trim() || submitting || !mission) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await completeMissionAction({
        missionId: mission.id,
        submissionUrl: submissionUrl.trim(),
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setCompleted(true);
        setEarnedXp(res.xpEarned || mission.xp);
      }
    } catch {
      setErrorMsg('Failed to submit mission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3" style={{ background: '#0D0D0F' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#C8F135' }} />
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Loading mission...</span>
      </div>
    );
  }

  if (!mission) {
    notFound();
  }

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header
        className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center gap-4"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <Link href="/missions" className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Missions
        </Link>
        <span style={{ color: '#2A2A30' }}>·</span>
        <span className="font-mono text-xs truncate" style={{ color: '#7A7A8C' }}>{mission.title}</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        {errorMsg && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl border font-body text-xs leading-relaxed"
            style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171' }}
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* ── HERO ── */}
        <div className="rounded-2xl border p-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full" style={{ background: '#1C1C20', color: '#7A7A8C', border: '1px solid #2A2A30' }}>
                  {mission.category}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(200,241,53,0.08)', color: '#C8F135' }}>
                  {mission.difficulty}
                </span>
                {completed && (
                  <span className="flex items-center gap-1 font-mono text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(200,241,53,0.15)', color: '#C8F135' }}>
                    <CheckCircle2 size={12} /> Completed
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-2xl" style={{ color: '#E8E8F0' }}>{mission.title}</h1>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="font-display font-bold text-2xl" style={{ color: '#C8F135' }}>+{mission.xp}</div>
              <div className="font-mono text-[9px]" style={{ color: '#7A7A8C' }}>XP Reward</div>
            </div>
          </div>

          <p className="font-body text-sm leading-relaxed mb-6" style={{ color: '#E8E8F0' }}>{mission.description}</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {mission.skills.map(s => <Tag key={s} label={s} variant="dim" />)}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono" style={{ color: '#7A7A8C' }}>
            <span className="flex items-center gap-1.5"><Clock size={13} /> {mission.estimatedTime}</span>
            <span className="flex items-center gap-1.5"><Award size={13} /> Proof-of-Work Badge</span>
          </div>
        </div>

        {/* ── DELIVERABLES ── */}
        <div className="rounded-2xl border p-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>REQUIRED DELIVERABLES</h2>
          <div className="flex flex-col gap-3">
            {mission.deliverables.map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: '#1C1C20', borderColor: '#2A2A30' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs" style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135' }}>
                  {i + 1}
                </div>
                <span className="font-body text-sm" style={{ color: '#E8E8F0' }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SUBMISSION FORM ── */}
        <div className="rounded-2xl border p-6" style={{ background: '#141416', borderColor: completed ? 'rgba(200,241,53,0.3)' : '#2A2A30' }}>
          {completed ? (
            <div className="text-center py-4">
              <CheckCircle2 size={36} className="mx-auto mb-3" style={{ color: '#C8F135' }} />
              <h3 className="font-display font-bold text-xl mb-1" style={{ color: '#E8E8F0' }}>Mission Completed!</h3>
              <p className="font-body text-sm mb-4" style={{ color: '#7A7A8C' }}>
                You earned <strong style={{ color: '#C8F135' }}>+{earnedXp} XP</strong>. An update has been broadcast to the feed.
              </p>
              <Link href="/feed" className="inline-flex items-center gap-2 font-display font-semibold text-xs px-5 py-2.5 rounded-xl" style={{ background: '#C8F135', color: '#0D0D0F' }}>
                View Activity Feed →
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="font-display font-bold text-base mb-1" style={{ color: '#E8E8F0' }}>Submit Your Work</h2>
              <p className="font-body text-xs mb-4" style={{ color: '#7A7A8C' }}>Paste your GitHub repository link or live demo URL (Self-Reported URL submission) to claim XP.</p>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="https://github.com/yourusername/project-repo"
                  value={submissionUrl}
                  onChange={e => setSubmissionUrl(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl font-body text-sm outline-none transition-all"
                  style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                  onFocus={e => { e.target.style.borderColor = '#C8F135'; }}
                  onBlur={e => { e.target.style.borderColor = '#2A2A30'; }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!submissionUrl.trim() || submitting}
                  className="w-full h-11 rounded-xl font-display font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  style={{
                    background: submissionUrl.trim() && !submitting ? '#C8F135' : '#1C1C20',
                    color: submissionUrl.trim() && !submitting ? '#0D0D0F' : '#3A3A46',
                    cursor: submissionUrl.trim() && !submitting ? 'pointer' : 'not-allowed',
                  }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />} Submit & Claim +{mission.xp} XP
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
