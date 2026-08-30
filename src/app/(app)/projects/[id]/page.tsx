// src/app/(app)/projects/[id]/page.tsx
'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProjectById, applyForProjectRoleAction } from '@/lib/actions/projects';
import { ProjectFull } from '@/lib/mock';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { ArrowLeft, Globe, Users, CheckSquare, Square, Send, Loader2, AlertCircle } from 'lucide-react';

function GithubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showApplyFor, setShowApplyFor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProject() {
      setLoading(true);
      try {
        const data = await fetchProjectById(id);
        if (isMounted) setProject(data);
      } catch (err) {
        console.error('[ProjectDetail Load Error]:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProject();
    return () => { isMounted = false; };
  }, [id]);

  const handleApply = async (role: string) => {
    if (!message.trim() || !project) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await applyForProjectRoleAction({
        projectId: project.id,
        role,
        message: message.trim(),
      });
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setApplied(role);
        setShowApplyFor(null);
        setMessage('');
        setProject({ ...project, applicants: (project.applicants || 0) + 1 });
      }
    } catch {
      setErrorMsg('Failed to send role application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3" style={{ background: '#0D0D0F' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#C8F135' }} />
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  const doneCount = project.tasks.filter(t => t.done).length;
  const progress = project.tasks.length > 0 ? Math.round((doneCount / project.tasks.length) * 100) : 0;
  const openRoles = project.openRoles.filter(r => !r.filled);

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header
        className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center gap-4"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <Link href="/projects" className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Projects
        </Link>
        <span style={{ color: '#2A2A30' }}>·</span>
        <span className="font-mono text-xs truncate" style={{ color: '#7A7A8C' }}>{project.name}</span>
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

        {/* ── HERO CARD ── */}
        <div className="rounded-2xl border p-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="font-display font-bold text-2xl" style={{ color: '#E8E8F0' }}>{project.name}</h1>
                <span
                  className="font-mono text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: project.status === 'building' ? 'rgba(200,241,53,0.1)' : 'rgba(155,184,42,0.1)',
                    color: project.status === 'building' ? '#C8F135' : '#9BB82A',
                    border: `1px solid ${project.status === 'building' ? 'rgba(200,241,53,0.2)' : 'rgba(155,184,42,0.2)'}`,
                  }}
                >
                  {project.status}
                </span>
              </div>
              <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>{project.tagline}</p>
              <p className="font-mono text-xs mt-1" style={{ color: '#3A3A46' }}>{project.category} · {project.college}</p>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="font-display font-bold text-xl" style={{ color: '#C8F135' }}>{project.xpReward}</div>
              <div className="font-mono text-[9px]" style={{ color: '#7A7A8C' }}>XP to earn</div>
            </div>
          </div>

          <p className="font-body text-sm leading-relaxed mb-5" style={{ color: '#E8E8F0' }}>{project.description}</p>

          {/* Stack */}
          <div className="flex flex-wrap gap-2 mb-5">
            {project.stack.map(s => <Tag key={s} label={s} variant="dim" />)}
          </div>

          {/* Links */}
          <div className="flex gap-3 flex-wrap">
            {project.githubUrl && (
              <a href={`https://${project.githubUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >
                <GithubIcon /> GitHub
              </a>
            )}
            {project.liveUrl && (
              <a href={`https://${project.liveUrl.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#9BB82A'; e.currentTarget.style.color = '#9BB82A'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >
                <Globe size={12} /> Live
              </a>
            )}
            <span className="ml-auto flex items-center gap-1 font-mono text-xs" style={{ color: '#7A7A8C' }}>
              <Users size={11} /> {project.applicants} interested
            </span>
          </div>
        </div>

        {/* ── OPEN ROLES ── */}
        {openRoles.length > 0 && (
          <div>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>OPEN ROLES</h2>
            <div className="flex flex-col gap-3">
              {openRoles.map(role => (
                <div key={role.role} className="rounded-xl border p-4" style={{ background: '#141416', borderColor: '#2A2A30' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-1" style={{ color: '#E8E8F0' }}>{role.role}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {role.skills.map(s => <Tag key={s} label={s} />)}
                      </div>
                    </div>
                    {applied === role.role ? (
                      <span className="font-mono text-xs px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.2)' }}>
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowApplyFor(role.role)}
                        className="font-display font-medium text-xs px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
                        style={{ background: '#C8F135', color: '#0D0D0F' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {/* Apply panel */}
                  {showApplyFor === role.role && applied !== role.role && (
                    <div className="border-t pt-3 mt-1" style={{ borderColor: '#2A2A30' }}>
                      <textarea
                        placeholder={`Tell ${project.members[0]?.name.split(' ')[0] || 'the project owner'} why you'd be great as ${role.role}...`}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl font-body text-sm outline-none resize-none transition-all mb-2"
                        style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                        onFocus={e => { e.target.style.borderColor = '#C8F135'; }}
                        onBlur={e => { e.target.style.borderColor = '#2A2A30'; }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowApplyFor(null)} className="font-body text-xs px-3 py-1.5 rounded-lg" style={{ color: '#7A7A8C' }}>
                          Cancel
                        </button>
                        <button
                          onClick={() => handleApply(role.role)}
                          disabled={!message.trim() || submitting}
                          className="flex items-center gap-1.5 font-display font-medium text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: message.trim() && !submitting ? '#C8F135' : '#1C1C20', color: message.trim() && !submitting ? '#0D0D0F' : '#3A3A46' }}
                        >
                          {submitting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Send Application
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TEAM ── */}
        <div>
          <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>TEAM</h2>
          <div className="flex flex-col gap-2">
            {project.members.map(m => (
              <Link
                key={m.handle}
                href={`/profile/${m.handle}`}
                className="card-hover flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: '#141416', borderColor: '#2A2A30' }}
              >
                <Avatar initials={m.avatar || 'SB'} size="sm" />
                <div className="flex-1">
                  <span className="font-display font-medium text-sm" style={{ color: '#E8E8F0' }}>{m.name}</span>
                  <span className="ml-2 font-body text-xs" style={{ color: '#7A7A8C' }}>{m.role}</span>
                </div>
                <span className="font-mono text-xs" style={{ color: '#3A3A46' }}>@{m.handle}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── PROGRESS / TASKS ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs" style={{ color: '#7A7A8C' }}>TASKS</h2>
            <span className="font-mono text-xs" style={{ color: '#C8F135' }}>{doneCount}/{project.tasks.length} done · {progress}%</span>
          </div>
          <div className="mb-4">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1C1C20' }}>
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #9BB82A, #C8F135)' }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {project.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: '#141416', borderColor: '#2A2A30' }}>
                {task.done
                  ? <CheckSquare size={15} style={{ color: '#C8F135', flexShrink: 0 }} />
                  : <Square size={15} style={{ color: '#3A3A46', flexShrink: 0 }} />
                }
                <span className="font-body text-sm" style={{ color: task.done ? '#7A7A8C' : '#E8E8F0', textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}