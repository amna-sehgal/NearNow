'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Trophy, Rocket, Search, GitMerge, Plus, X, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { createActivityAction } from '@/lib/actions/activities';
import { getCurrentUser } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/client';

const POST_TYPES = [
  { key: 'started_project', icon: Plus,     label: 'New Project',     desc: 'Started something new' },
  { key: 'looking_for',     icon: Search,   label: 'Looking for',     desc: 'Need a teammate' },
  { key: 'deployed',        icon: Rocket,   label: 'Shipped',         desc: 'Deployed or launched' },
  { key: 'won_hackathon',   icon: Trophy,   label: 'Won',             desc: 'Hackathon or competition' },
  { key: 'contributed_oss', icon: GitMerge, label: 'Contributed',     desc: 'Open source contribution' },
  { key: 'earned_xp',       icon: Zap,      label: 'Completed',       desc: 'Skill mission or challenge' },
];

const SUGGESTED_TAGS = ['React', 'Node.js', 'Python', 'Next.js', 'MongoDB', 'TypeScript', 'Flutter', 'TensorFlow', 'Docker', 'AWS', 'Figma', 'PostgreSQL'];

export default function CreatePost() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('');
  const [content, setContent] = useState('');
  const [meta, setMeta] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // 1. Try server action getCurrentUser() (checks server cookies)
        const currentUser = await getCurrentUser();
        if (currentUser?.profile) {
          setUser({ id: currentUser.id, ...currentUser.profile });
          return;
        }

        // 2. Try browser client
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  const addTag = (t: string) => {
    const clean = t.trim();
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const handleSubmit = async () => {
    if (!selectedType || !content.trim()) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await createActivityAction({
        type: selectedType,
        content: content.trim(),
        meta: meta.trim() || undefined,
        tags,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMsg('Failed to submit post to database.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0D0D0F' }}>
        <div className="text-center max-w-sm border rounded-2xl p-8" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(200,241,53,0.1)', border: '2px solid rgba(200,241,53,0.3)' }}
          >
            <Zap size={28} style={{ color: '#C8F135' }} />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: '#E8E8F0' }}>
            Activity posted!
          </h2>
          <p className="font-body text-sm mb-8" style={{ color: '#7A7A8C' }}>
            Your update is live in the database and feed. Other builders can see it now.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/feed"
              className="font-display font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
              style={{ background: '#C8F135', color: '#0D0D0F' }}
            >
              View Feed
            </Link>
            <button
              onClick={() => { setSubmitted(false); setSelectedType(''); setContent(''); setMeta(''); setTags([]); setErrorMsg(null); }}
              className="font-body text-sm px-5 py-2.5 rounded-xl border transition-all"
              style={{ borderColor: '#2A2A30', color: '#7A7A8C' }}
            >
              Post Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header
        className="sticky top-0 z-40 border-b px-4 md:px-6 h-14 flex items-center gap-4"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <Link
          href="/feed"
          className="flex items-center gap-2 font-body text-sm transition-colors"
          style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} />
          Feed
        </Link>
        <span style={{ color: '#2A2A30' }}>·</span>
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>New Activity</span>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#E8E8F0' }}>
            Share what you&apos;re building
          </h1>
          <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>
            Let other builders see your progress and opportunities.
          </p>
        </div>

        {/* Auth Check Warning */}
        {!checkingAuth && !user && (
          <div
            className="flex items-center justify-between p-4 rounded-xl mb-6 border font-body text-sm"
            style={{ background: 'rgba(200,241,53,0.06)', borderColor: 'rgba(200,241,53,0.25)', color: '#E8E8F0' }}
          >
            <div className="flex items-center gap-2.5">
              <LogIn size={18} style={{ color: '#C8F135' }} />
              <div>
                <span className="font-semibold">Sign in required</span>
                <p className="text-xs" style={{ color: '#7A7A8C' }}>You need an account to post to the live feed.</p>
              </div>
            </div>
            <Link
              href="/auth"
              className="font-display font-semibold text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
              style={{ background: '#C8F135', color: '#0D0D0F' }}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl mb-6 border font-body text-xs leading-relaxed"
            style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171' }}
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Type selector */}
        <div className="mb-6">
          <label className="font-mono text-xs mb-3 block" style={{ color: '#7A7A8C' }}>
            WHAT ARE YOU SHARING?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POST_TYPES.map(t => {
              const Icon = t.icon;
              const isActive = selectedType === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setSelectedType(t.key)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200"
                  style={{
                    background: isActive ? 'rgba(200,241,53,0.08)' : '#141416',
                    borderColor: isActive ? 'rgba(200,241,53,0.35)' : '#2A2A30',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? 'rgba(200,241,53,0.15)' : '#1C1C20' }}
                  >
                    <Icon size={13} style={{ color: isActive ? '#C8F135' : '#7A7A8C' }} />
                  </div>
                  <div>
                    <div className="font-display font-medium text-xs" style={{ color: isActive ? '#C8F135' : '#E8E8F0' }}>
                      {t.label}
                    </div>
                    <div className="font-body text-[10px]" style={{ color: '#3A3A46' }}>
                      {t.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="font-mono text-xs mb-2 block" style={{ color: '#7A7A8C' }}>
            WHAT DID YOU DO?
          </label>
          <textarea
            placeholder="e.g. Deployed the auth backend for CampusConnect. 3 weeks of Node.js + JWT work finally live."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none resize-none transition-all duration-200"
            style={{
              background: '#141416',
              border: '1px solid #2A2A30',
              color: '#E8E8F0',
            }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Meta */}
        <div className="mb-5">
          <label className="font-mono text-xs mb-2 block" style={{ color: '#7A7A8C' }}>
            EXTRA DETAIL <span style={{ color: '#3A3A46' }}>(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Project name, link, or what you need"
            value={meta}
            onChange={e => setMeta(e.target.value)}
            className="w-full h-10 px-4 rounded-xl font-body text-sm outline-none transition-all duration-200"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Tags */}
        <div className="mb-8">
          <label className="font-mono text-xs mb-2 block" style={{ color: '#7A7A8C' }}>
            TECH STACK / TAGS <span style={{ color: '#3A3A46' }}>(up to 5)</span>
          </label>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(t => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.2)', color: '#C8F135' }}
                >
                  {t}
                  <button type="button" onClick={() => removeTag(t)}>
                    <X size={10} style={{ color: '#9BB82A' }} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            type="text"
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
            className="w-full h-10 px-4 rounded-xl font-mono text-sm outline-none transition-all duration-200 mb-3"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
          />

          {/* Suggested tags */}
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 8).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className="font-mono text-[11px] px-2 py-0.5 rounded-full border transition-all duration-150"
                style={{ background: '#141416', borderColor: '#2A2A30', color: '#7A7A8C' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedType || !content.trim() || submitting || !user}
          className="w-full h-12 rounded-xl font-display font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: selectedType && content.trim() && user ? '#C8F135' : '#1C1C20',
            color: selectedType && content.trim() && user ? '#0D0D0F' : '#3A3A46',
            cursor: selectedType && content.trim() && user && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (selectedType && content.trim() && user && !submitting) { e.currentTarget.style.background = '#d4f547'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,241,53,0.2)'; } }}
          onMouseLeave={e => { if (selectedType && content.trim() && user && !submitting) { e.currentTarget.style.background = '#C8F135'; e.currentTarget.style.boxShadow = 'none'; } }}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving to Database...
            </>
          ) : (
            'Post to Feed'
          )}
        </button>
      </main>
    </div>
  );
}
