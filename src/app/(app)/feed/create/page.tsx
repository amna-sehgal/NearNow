'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Trophy, Rocket, Search, GitMerge, Plus, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/hooks';

const POST_TYPES = [
  { key: 'started_project', icon: Plus,     label: 'New Project',  desc: 'Started something new',        xp: 50  },
  { key: 'looking_for',     icon: Search,   label: 'Looking for',  desc: 'Need a teammate',               xp: 20  },
  { key: 'deployed',        icon: Rocket,   label: 'Shipped',      desc: 'Deployed or launched',          xp: 80  },
  { key: 'won_hackathon',   icon: Trophy,   label: 'Won',          desc: 'Hackathon or competition',      xp: 150 },
  { key: 'contributed_oss', icon: GitMerge, label: 'Contributed',  desc: 'Open source contribution',     xp: 100 },
  { key: 'earned_xp',       icon: Zap,      label: 'Completed',    desc: 'Skill mission or challenge',    xp: 120 },
];

const SUGGESTED_TAGS = ['React', 'Node.js', 'Python', 'Next.js', 'MongoDB', 'TypeScript', 'Flutter', 'TensorFlow', 'Docker', 'AWS', 'Figma', 'PostgreSQL'];

export default function CreatePost() {
  const router = useRouter();
  useProfile();
  const [selectedType, setSelectedType] = useState('');
  const [content, setContent] = useState('');
  const [meta, setMeta] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addTag = (t: string) => { const c = t.trim(); if (c && !tags.includes(c) && tags.length < 5) { setTags([...tags, c]); setTagInput(''); } };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

const handleSubmit = async () => {
  setSubmitting(true);
  setError('');
  const supabase = createClient();

  // Get user directly — don't rely on hook timing
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) { setError('Not logged in. Please refresh.'); setSubmitting(false); return; }

  const postType = POST_TYPES.find(t => t.key === selectedType);
  const xpEarned = postType?.xp || 0;

  const { error: activityError } = await supabase.from('activities').insert({
    user_id: currentUser.id,
    type: selectedType,
    content: content.trim(),
    meta: meta.trim() || null,
    tags,
    xp: xpEarned,
  });

  if (activityError) { setError(activityError.message); setSubmitting(false); return; }

  router.push('/feed');
};
  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-40 border-b px-4 md:px-6 h-14 flex items-center gap-4"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <Link href="/feed" className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Feed
        </Link>
        <span style={{ color: '#2A2A30' }}>·</span>
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>New Activity</span>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#E8E8F0' }}>Share what you&apos;re building</h1>
          <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>Let other builders see your progress and opportunities.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl font-body text-sm" style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Type selector */}
        <div className="mb-6">
          <label className="font-mono text-xs mb-3 block" style={{ color: '#7A7A8C' }}>WHAT ARE YOU SHARING?</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POST_TYPES.map(t => {
              const Icon = t.icon;
              const isActive = selectedType === t.key;
              return (
                <button key={t.key} onClick={() => setSelectedType(t.key)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200"
                  style={{ background: isActive ? 'rgba(200,241,53,0.08)' : '#141416', borderColor: isActive ? 'rgba(200,241,53,0.35)' : '#2A2A30' }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? 'rgba(200,241,53,0.15)' : '#1C1C20' }}>
                    <Icon size={13} style={{ color: isActive ? '#C8F135' : '#7A7A8C' }} />
                  </div>
                  <div>
                    <div className="font-display font-medium text-xs" style={{ color: isActive ? '#C8F135' : '#E8E8F0' }}>{t.label}</div>
                    <div className="font-body text-[10px]" style={{ color: '#3A3A46' }}>+{t.xp} XP</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="font-mono text-xs mb-2 block" style={{ color: '#7A7A8C' }}>WHAT DID YOU DO?</label>
          <textarea placeholder="e.g. Deployed the auth backend for CampusConnect..."
            value={content} onChange={e => setContent(e.target.value)} rows={3}
            className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none resize-none transition-all"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div className="mb-5">
          <label className="font-mono text-xs mb-2 block" style={{ color: '#7A7A8C' }}>EXTRA DETAIL <span style={{ color: '#3A3A46' }}>(optional)</span></label>
          <input type="text" placeholder="Project name, link, or what you need"
            value={meta} onChange={e => setMeta(e.target.value)}
            className="w-full h-10 px-4 rounded-xl font-body text-sm outline-none transition-all"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Tags */}
        <div className="mb-8">
          <label className="font-mono text-xs mb-2 block" style={{ color: '#7A7A8C' }}>TECH STACK / TAGS <span style={{ color: '#3A3A46' }}>(up to 5)</span></label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.2)', color: '#C8F135' }}>
                  {t}<button onClick={() => removeTag(t)}><X size={10} style={{ color: '#9BB82A' }} /></button>
                </span>
              ))}
            </div>
          )}
          <input type="text" placeholder="Type a tag and press Enter"
            value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }}}
            className="w-full h-10 px-4 rounded-xl font-mono text-sm outline-none transition-all mb-3"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
          />
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 8).map(t => (
              <button key={t} onClick={() => addTag(t)}
                className="font-mono text-[11px] px-2 py-0.5 rounded-full border transition-all"
                style={{ background: '#141416', borderColor: '#2A2A30', color: '#7A7A8C' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >+ {t}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!selectedType || !content.trim() || submitting}
          className="w-full h-12 rounded-xl font-display font-semibold text-sm transition-all duration-200"
          style={{ background: selectedType && content.trim() && !submitting ? '#C8F135' : '#1C1C20', color: selectedType && content.trim() && !submitting ? '#0D0D0F' : '#3A3A46', cursor: selectedType && content.trim() && !submitting ? 'pointer' : 'not-allowed' }}
          onMouseEnter={e => { if (selectedType && content.trim() && !submitting) { e.currentTarget.style.background = '#d4f547'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,241,53,0.2)'; }}}
          onMouseLeave={e => { if (selectedType && content.trim() && !submitting) { e.currentTarget.style.background = '#C8F135'; e.currentTarget.style.boxShadow = 'none'; }}}
        >
          {submitting ? 'Posting...' : 'Post to Feed'}
        </button>
      </main>
    </div>
  );
}