// src/app/(app)/projects/create/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, X, Check, Loader2, AlertCircle, LogIn } from 'lucide-react';
import Tag from '@/components/ui/Tag';
import { ALL_STACKS, ALL_ROLES, PROJECT_CATEGORIES } from '@/lib/mock';
import { createProjectAction } from '@/lib/actions/projects';
import { getCurrentUser } from '@/lib/actions/auth';

const STEPS = ['Idea', 'Stack', 'Team', 'Details'];

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'EdTech / Community',
    stack: [] as string[],
    stackInput: '',
    roles: [] as { role: string; skills: string[] }[],
    github: '',
    live: '',
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const current = await getCurrentUser();
        if (current?.profile) {
          setUser(current);
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

  const canNext = [
    form.name.trim().length > 2 && form.tagline.trim().length > 5 && form.category,
    form.stack.length > 0,
    true, // roles optional
    form.description.trim().length > 20,
  ];

  const addStack = (s: string) => { const c = s.trim(); if (c && !form.stack.includes(c)) setForm({ ...form, stack: [...form.stack, c], stackInput: '' }); };
  const removeStack = (s: string) => setForm({ ...form, stack: form.stack.filter(x => x !== s) });

  const addRole = (r: string) => { if (!form.roles.find(x => x.role === r)) setForm({ ...form, roles: [...form.roles, { role: r, skills: [] }] }); };
  const removeRole = (r: string) => setForm({ ...form, roles: form.roles.filter(x => x.role !== r) });

  const handleSubmit = async () => {
    if (!canNext[3] || submitting) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await createProjectAction({
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        category: form.category,
        stack: form.stack,
        roles: form.roles,
        description: form.description.trim(),
        githubUrl: form.github.trim() || undefined,
        liveUrl: form.live.trim() || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.projectId) {
        router.push(`/projects/${res.projectId}`);
      } else {
        router.push('/projects');
      }
    } catch {
      setErrorMsg('An unexpected error occurred while launching project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header
        className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center gap-4"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <Link href="/projects" className="flex items-center gap-2 font-body text-sm" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Projects
        </Link>
        <span style={{ color: '#2A2A30' }}>·</span>
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>New Project</span>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-8 py-8">
        {!checkingAuth && !user && (
          <div
            className="flex items-center justify-between p-4 rounded-xl mb-6 border font-body text-sm"
            style={{ background: 'rgba(200,241,53,0.06)', borderColor: 'rgba(200,241,53,0.25)', color: '#E8E8F0' }}
          >
            <div className="flex items-center gap-2.5">
              <LogIn size={18} style={{ color: '#C8F135' }} />
              <div>
                <span className="font-semibold">Sign in required</span>
                <p className="text-xs" style={{ color: '#7A7A8C' }}>You must be logged in to launch a project.</p>
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

        {errorMsg && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl mb-6 border font-body text-xs leading-relaxed"
            style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171' }}
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs transition-all duration-300"
                style={{
                  background: i < step ? '#C8F135' : i === step ? 'rgba(200,241,53,0.15)' : '#141416',
                  color: i < step ? '#0D0D0F' : i === step ? '#C8F135' : '#3A3A46',
                  border: `1px solid ${i <= step ? 'rgba(200,241,53,0.4)' : '#2A2A30'}`,
                }}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className="font-body text-xs hidden sm:inline" style={{ color: i === step ? '#E8E8F0' : '#3A3A46' }}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px ml-1" style={{ background: i < step ? '#C8F135' : '#2A2A30' }} />}
            </div>
          ))}
        </div>

        {/* Step 0 — Idea */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display font-bold text-xl mb-1" style={{ color: '#E8E8F0' }}>What are you building?</h2>
              <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>Give it a name and tell builders the one-line pitch.</p>
            </div>
            <FormField label="Project name">
              <FormInput value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Near Now, EcoTrack, MediAlert..." />
            </FormField>
            <FormField label="Tagline">
              <FormInput value={form.tagline} onChange={v => setForm({ ...form, tagline: v })} placeholder="The collaboration layer for Indian college students" />
            </FormField>
            <FormField label="Category">
              <div className="flex flex-wrap gap-2">
                {PROJECT_CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                    className="h-8 px-3 rounded-full font-mono text-xs transition-all"
                    style={{
                      background: form.category === cat ? 'rgba(200,241,53,0.12)' : '#141416',
                      border: `1px solid ${form.category === cat ? 'rgba(200,241,53,0.4)' : '#2A2A30'}`,
                      color: form.category === cat ? '#C8F135' : '#7A7A8C',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        )}

        {/* Step 1 — Stack */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display font-bold text-xl mb-1" style={{ color: '#E8E8F0' }}>Tech stack</h2>
              <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>What are you building with?</p>
            </div>
            {form.stack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.stack.map(s => (
                  <span key={s} className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', color: '#C8F135' }}>
                    {s} <button onClick={() => removeStack(s)}><X size={10} style={{ color: '#9BB82A' }} /></button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="Type a technology and press Enter"
              value={form.stackInput}
              onChange={e => setForm({ ...form, stackInput: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStack(form.stackInput); }}}
              className="w-full h-10 px-3 rounded-xl font-mono text-sm outline-none transition-all"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
              onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
            />
            <div className="flex flex-wrap gap-1.5">
              {ALL_STACKS.filter(s => !form.stack.includes(s)).map(s => (
                <button key={s} onClick={() => addStack(s)}
                  className="font-mono text-[11px] px-2 py-0.5 rounded-full border transition-all"
                  style={{ background: '#141416', borderColor: '#2A2A30', color: '#7A7A8C' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Roles */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display font-bold text-xl mb-1" style={{ color: '#E8E8F0' }}>Who do you need?</h2>
              <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>Select open roles. You can always add more later.</p>
            </div>
            {form.roles.length > 0 && (
              <div className="flex flex-col gap-2">
                {form.roles.map(r => (
                  <div key={r.role} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: '#141416', borderColor: 'rgba(200,241,53,0.2)' }}>
                    <span className="font-display font-medium text-sm" style={{ color: '#C8F135' }}>{r.role}</span>
                    <button onClick={() => removeRole(r.role)}><X size={14} style={{ color: '#7A7A8C' }} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {ALL_ROLES.filter(r => !form.roles.find(x => x.role === r)).map(r => (
                <button key={r} onClick={() => addRole(r)}
                  className="flex items-center gap-2 p-3 rounded-xl border text-left transition-all"
                  style={{ background: '#141416', borderColor: '#2A2A30', color: '#7A7A8C' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A3A44'; e.currentTarget.style.color = '#E8E8F0'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
                >
                  <Plus size={14} />
                  <span className="font-body text-sm">{r}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Details */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display font-bold text-xl mb-1" style={{ color: '#E8E8F0' }}>Tell the story</h2>
              <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>Give potential teammates enough context to get excited.</p>
            </div>
            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={5}
                placeholder="What problem does it solve? Who is it for? What makes it interesting?"
                className="w-full px-3 py-2.5 rounded-xl font-body text-sm outline-none resize-none transition-all"
                style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
                onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
              />
            </FormField>
            <FormField label="GitHub URL (optional)">
              <FormInput value={form.github} onChange={v => setForm({ ...form, github: v })} placeholder="github.com/your/repo" />
            </FormField>
            <FormField label="Live URL (optional)">
              <FormInput value={form.live} onChange={v => setForm({ ...form, live: v })} placeholder="yourproject.in" />
            </FormField>

            {/* Summary preview */}
            <div className="rounded-xl border p-4" style={{ background: '#1C1C20', borderColor: '#2A2A30' }}>
              <p className="font-mono text-[10px] mb-3" style={{ color: '#7A7A8C' }}>PREVIEW</p>
              <p className="font-display font-bold text-base mb-1" style={{ color: '#E8E8F0' }}>{form.name || 'Untitled Project'}</p>
              <p className="font-body text-xs mb-3" style={{ color: '#7A7A8C' }}>{form.tagline || 'Project tagline'}</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.stack.slice(0, 4).map(s => <Tag key={s} label={s} />)}
              </div>
              {form.roles.length > 0 && (
                <p className="font-mono text-[10px]" style={{ color: '#C8F135' }}>
                  {form.roles.length} open role{form.roles.length > 1 ? 's' : ''}: {form.roles.map(r => r.role).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 font-body text-sm px-4 py-2.5 rounded-xl border transition-all"
              style={{ borderColor: '#2A2A30', color: '#7A7A8C' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A3A44'; e.currentTarget.style.color = '#E8E8F0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext[step]}
              className="flex items-center gap-2 font-display font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
              style={{
                background: canNext[step] ? '#C8F135' : '#1C1C20',
                color: canNext[step] ? '#0D0D0F' : '#3A3A46',
              }}
              onMouseEnter={e => { if (canNext[step]) e.currentTarget.style.background = '#d4f547'; }}
              onMouseLeave={e => { if (canNext[step]) e.currentTarget.style.background = '#C8F135'; }}
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext[step] || submitting || !user}
              className="flex items-center gap-2 font-display font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
              style={{
                background: canNext[step] && user ? '#C8F135' : '#1C1C20',
                color: canNext[step] && user ? '#0D0D0F' : '#3A3A46',
                opacity: submitting ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (canNext[step] && user && !submitting) e.currentTarget.style.background = '#d4f547'; }}
              onMouseLeave={e => { if (canNext[step] && user && !submitting) e.currentTarget.style.background = '#C8F135'; }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Launching...
                </>
              ) : (
                'Launch project 🚀'
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px]" style={{ color: '#7A7A8C' }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}
function FormInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all"
      style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
      onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
      onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
    />
  );
}