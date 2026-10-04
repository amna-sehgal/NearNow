'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/hooks';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { ArrowLeft, Globe, Users, CheckSquare, Square, Send, ChevronRight, UserCheck, UserX, Clock } from 'lucide-react';

function GithubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

interface Application {
  id: string;
  role: string;
  message: string;
  status: string;
  created_at: string;
  applicant_id: string;
  profiles: { name: string; handle: string; avatar: string; skills: string[]; college: string; };
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile, user } = useProfile();
  const [project, setProject] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showApplyFor, setShowApplyFor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      setProject(data);

      if (user) {
        // Check if current user already applied
        const { data: appData } = await supabase
          .from('project_applications')
          .select('role, status')
          .eq('project_id', id)
          .eq('applicant_id', user.id)
          .maybeSingle();
        if (appData) {
          setApplied(appData.role);
          setApplicationStatus(appData.status);
        }

        // If owner, load all applications with applicant profiles
        if (data && data.owner_id === user.id) {
          const { data: apps } = await supabase
            .from('project_applications')
            .select('*, profiles:applicant_id(name, handle, avatar, skills, college)')
            .eq('project_id', id)
            .order('created_at', { ascending: false });
          setApplications(apps || []);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleApply = async (role: string) => {
    if (!user || !profile) return;
    setSubmitting(true);
    setError('');
    const supabase = createClient();

    // Insert application
    const { error: appError } = await supabase
      .from('project_applications')
      .insert({
        project_id: id,
        applicant_id: user.id,
        role,
        message: message.trim(),
        status: 'pending',
      });

    if (appError) { setError(appError.message); setSubmitting(false); return; }

    // Update applicants count
    await supabase
      .from('projects')
      .update({ applicants: (project.applicants || 0) + 1 })
      .eq('id', id);

    // Notify project owner
    await supabase.from('notifications').insert({
      user_id: project.owner_id,
      type: 'project_apply',
      title: `New application for ${role}`,
      body: `${profile.name} applied to join ${project.name} as ${role}`,
      link: `/projects/${id}`,
      read: false,
      // Store applicant info for accept/decline
      meta: JSON.stringify({
        applicant_id: user.id,
        applicant_handle: profile.handle,
        applicant_name: profile.name,
        role,
        project_id: id,
        project_name: project.name,
      }),
    });

    // Post activity to feed
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'joined_project',
      content: `applied to join ${project.name} as ${role}`,
      meta: project.tagline,
      tags: project.stack?.slice(0, 3) || [],
    });

    setApplied(role);
    setApplicationStatus('pending');
    setShowApplyFor(null);
    setMessage('');
    setSubmitting(false);
  };

  // Owner accepts an application
  const handleAccept = async (app: Application) => {
    if (!user || !project) return;
    setActing(app.id);
    const supabase = createClient();

    // Update application status
    await supabase
      .from('project_applications')
      .update({ status: 'accepted' })
      .eq('id', app.id);

    // Add to project members
    const currentMembers = project.members || [];
    const alreadyMember = currentMembers.some((m: any) => m.handle === app.profiles?.handle);
    if (!alreadyMember) {
      const newMember = {
        handle: app.profiles?.handle,
        name: app.profiles?.name,
        avatar: app.profiles?.avatar || app.profiles?.name?.slice(0,2).toUpperCase() || 'NN',
        role: app.role,
      };
      await supabase
        .from('projects')
        .update({ members: [...currentMembers, newMember] })
        .eq('id', id);
      setProject((prev: any) => ({ ...prev, members: [...currentMembers, newMember] }));
    }

    // Notify applicant — accepted
    await supabase.from('notifications').insert({
      user_id: app.applicant_id,
      type: 'application_accepted',
      title: '🎉 Application accepted!',
      body: `${profile?.name} accepted your application to join ${project.name} as ${app.role}`,
      link: `/projects/${id}`,
      read: false,
    });

    // Update local state
    setApplications(prev => prev.map(a =>
      a.id === app.id ? { ...a, status: 'accepted' } : a
    ));
    setActing(null);
  };

  // Owner declines an application
  const handleDecline = async (app: Application) => {
    if (!user || !project) return;
    setActing(app.id);
    const supabase = createClient();

    // Update application status
    await supabase
      .from('project_applications')
      .update({ status: 'declined' })
      .eq('id', app.id);

    // Notify applicant — declined
    await supabase.from('notifications').insert({
      user_id: app.applicant_id,
      type: 'application_declined',
      title: 'Application update',
      body: `Your application to join ${project.name} as ${app.role} was not accepted this time`,
      link: `/projects/${id}`,
      read: false,
    });

    setApplications(prev => prev.map(a =>
      a.id === app.id ? { ...a, status: 'declined' } : a
    ));
    setActing(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0F' }}>
      <div className="font-mono text-sm" style={{ color: '#7A7A8C' }}>Loading project...</div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0F' }}>
      <div className="text-center">
        <p className="font-display text-lg" style={{ color: '#3A3A46' }}>Project not found.</p>
        <Link href="/projects" className="font-mono text-xs mt-2 block" style={{ color: '#7A7A8C' }}>← Back to projects</Link>
      </div>
    </div>
  );

  const isOwner = project.owner_id === user?.id;
  const tasks = project.tasks || [];
  const openRoles = (project.open_roles || []).filter((r: any) => !r.filled);
  const members = project.members || [];
  const doneCount = tasks.filter((t: any) => t.done).length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const pendingApps = applications.filter(a => a.status === 'pending');
  const reviewedApps = applications.filter(a => a.status !== 'pending');

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center gap-4"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <Link href="/projects" className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        ><ArrowLeft size={14} /> Projects</Link>
        <span style={{ color: '#2A2A30' }}>·</span>
        <span className="font-mono text-xs truncate" style={{ color: '#7A7A8C' }}>{project.name}</span>
        {isOwner && (
          <span className="ml-auto font-mono text-xs px-2 py-1 rounded-full"
            style={{ background: 'rgba(200,241,53,0.08)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.15)' }}>
            your project
          </span>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {error && (
          <div className="px-4 py-3 rounded-xl font-body text-sm"
            style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Hero */}
        <div className="rounded-2xl border p-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="font-display font-bold text-2xl" style={{ color: '#E8E8F0' }}>{project.name}</h1>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: project.status === 'building' ? 'rgba(200,241,53,0.1)' : 'rgba(155,184,42,0.1)',
                    color: project.status === 'building' ? '#C8F135' : '#9BB82A',
                    border: `1px solid ${project.status === 'building' ? 'rgba(200,241,53,0.2)' : 'rgba(155,184,42,0.2)'}`,
                  }}>
                  {project.status}
                </span>
              </div>
              <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>{project.tagline}</p>
              <p className="font-mono text-xs mt-1" style={{ color: '#3A3A46' }}>
                {project.category}{project.college && ` · ${project.college}`}
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="font-display font-bold text-xl" style={{ color: '#C8F135' }}>{project.xp_reward}</div>
              <div className="font-mono text-[9px]" style={{ color: '#7A7A8C' }}>XP to earn</div>
            </div>
          </div>

          <p className="font-body text-sm leading-relaxed mb-5" style={{ color: '#E8E8F0' }}>{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {project.stack?.map((s: string) => <Tag key={s} label={s} variant="dim" />)}
          </div>

          <div className="flex gap-3 flex-wrap">
            {project.github_url && (
              <a href={`https://${project.github_url}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              ><GithubIcon /> GitHub</a>
            )}
            {project.live_url && (
              <a href={`https://${project.live_url}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#9BB82A'; e.currentTarget.style.color = '#9BB82A'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              ><Globe size={12} /> Live</a>
            )}
            <span className="ml-auto flex items-center gap-1 font-mono text-xs" style={{ color: '#7A7A8C' }}>
              <Users size={11} /> {project.applicants || 0} interested
            </span>
          </div>
        </div>

        {/* ── OPEN ROLES — non-owner ── */}
        {!isOwner && openRoles.length > 0 && (
          <div>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>OPEN ROLES</h2>
            <div className="flex flex-col gap-3">
              {openRoles.map((role: any) => (
                <div key={role.role} className="rounded-xl border p-4" style={{ background: '#141416', borderColor: '#2A2A30' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-sm mb-1" style={{ color: '#E8E8F0' }}>{role.role}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {role.skills?.map((s: string) => <Tag key={s} label={s} />)}
                      </div>
                    </div>

                    {/* Apply button states */}
                    {applied === role.role ? (
                      <span className="font-mono text-xs px-3 py-1.5 rounded-lg flex-shrink-0 flex items-center gap-1.5"
                        style={{
                          background: applicationStatus === 'accepted' ? 'rgba(200,241,53,0.12)' :
                                      applicationStatus === 'declined' ? 'rgba(255,80,80,0.08)' : 'rgba(200,241,53,0.08)',
                          color: applicationStatus === 'accepted' ? '#C8F135' :
                                 applicationStatus === 'declined' ? '#ff6b6b' : '#9BB82A',
                          border: `1px solid ${applicationStatus === 'accepted' ? 'rgba(200,241,53,0.2)' :
                                               applicationStatus === 'declined' ? 'rgba(255,80,80,0.2)' : 'rgba(155,184,42,0.2)'}`,
                        }}>
                        {applicationStatus === 'accepted' ? '✓ Accepted!' :
                         applicationStatus === 'declined' ? '✕ Not accepted' :
                         <><Clock size={11} /> Pending review</>}
                      </span>
                    ) : (
                      <button onClick={() => setShowApplyFor(role.role)}
                        className="font-display font-medium text-xs px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
                        style={{ background: '#C8F135', color: '#0D0D0F' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
                      >Apply</button>
                    )}
                  </div>

                  {showApplyFor === role.role && applied !== role.role && (
                    <div className="border-t pt-3 mt-1" style={{ borderColor: '#2A2A30' }}>
                      <textarea
                        placeholder={`Why would you be great as ${role.role}? Share your relevant experience.`}
                        value={message} onChange={e => setMessage(e.target.value)} rows={3}
                        className="w-full px-3 py-2.5 rounded-xl font-body text-sm outline-none resize-none transition-all mb-2"
                        style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                        onFocus={e => { e.target.style.borderColor = '#C8F135'; }}
                        onBlur={e => { e.target.style.borderColor = '#2A2A30'; }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowApplyFor(null)}
                          className="font-body text-xs px-3 py-1.5 rounded-lg"
                          style={{ color: '#7A7A8C' }}>Cancel</button>
                        <button onClick={() => handleApply(role.role)} disabled={!message.trim() || submitting}
                          className="flex items-center gap-1.5 font-display font-medium text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: message.trim() && !submitting ? '#C8F135' : '#1C1C20',
                            color: message.trim() && !submitting ? '#0D0D0F' : '#3A3A46',
                          }}
                        >
                          <Send size={11} />{submitting ? 'Sending...' : 'Send Application'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── APPLICATIONS — owner view ── */}
        {isOwner && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-xs" style={{ color: '#7A7A8C' }}>APPLICATIONS</h2>
              {pendingApps.length > 0 && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.2)' }}>
                  {pendingApps.length} pending
                </span>
              )}
            </div>

            {applications.length === 0 ? (
              <div className="rounded-xl border p-5 text-center"
                style={{ background: '#141416', borderColor: '#2A2A30' }}>
                <p className="font-body text-sm" style={{ color: '#3A3A46' }}>No applications yet.</p>
                <p className="font-body text-xs mt-1" style={{ color: '#3A3A46' }}>
                  Share your project so builders can find it.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Pending first */}
                {pendingApps.map(app => {
                  const prof = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
                  const isActing = acting === app.id;
                  return (
                    <div key={app.id} className="rounded-xl border p-4"
                      style={{ background: '#141416', borderColor: 'rgba(200,241,53,0.15)' }}>
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar initials={prof?.avatar || prof?.name?.slice(0,2).toUpperCase() || 'NN'} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <Link href={`/profile/${prof?.handle}`}
                              className="font-display font-semibold text-sm transition-colors"
                              style={{ color: '#E8E8F0' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#C8F135'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#E8E8F0'; }}
                            >{prof?.name}</Link>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(200,241,53,0.08)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.15)' }}>
                              {app.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>@{prof?.handle}</span>
                            {prof?.college && <><span style={{ color: '#2A2A30' }}>·</span>
                              <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>{prof.college}</span></>}
                            <span className="ml-auto font-mono text-[10px]" style={{ color: '#3A3A46' }}>{timeAgo(app.created_at)}</span>
                          </div>
                          {/* Applicant skills */}
                          {prof?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {prof.skills.slice(0,4).map((s: string) => <Tag key={s} label={s} />)}
                            </div>
                          )}
                          {/* Message */}
                          <p className="font-body text-xs p-2.5 rounded-lg" style={{ background: '#1C1C20', color: '#E8E8F0' }}>
                            &ldquo;{app.message}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Accept / Decline */}
                      <div className="flex gap-2 justify-end pt-2 border-t" style={{ borderColor: '#2A2A30' }}>
                        <Link href={`/profile/${prof?.handle}`}
                          className="font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                          style={{ color: '#7A7A8C' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#C8F135'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
                        >
                          <ChevronRight size={11} /> View profile
                        </Link>
                        <button onClick={() => handleDecline(app)} disabled={isActing}
                          className="flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#7A7A8C' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.color = '#ff6b6b'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
                        >
                          <UserX size={12} />{isActing ? '...' : 'Decline'}
                        </button>
                        <button onClick={() => handleAccept(app)} disabled={isActing}
                          className="flex items-center gap-1.5 font-display font-medium text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: isActing ? '#9BB82A' : '#C8F135', color: '#0D0D0F' }}
                          onMouseEnter={e => { if (!isActing) e.currentTarget.style.background = '#d4f547'; }}
                          onMouseLeave={e => { if (!isActing) e.currentTarget.style.background = '#C8F135'; }}
                        >
                          <UserCheck size={12} />{isActing ? 'Accepting...' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Reviewed applications */}
                {reviewedApps.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] mb-2 mt-2" style={{ color: '#3A3A46' }}>REVIEWED</p>
                    {reviewedApps.map(app => {
                      const prof = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
                      return (
                        <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                          style={{ background: '#141416', borderColor: '#2A2A30' }}>
                          <Avatar initials={prof?.avatar || prof?.name?.slice(0,2).toUpperCase() || 'NN'} size="sm" />
                          <div className="flex-1 min-w-0">
                            <span className="font-display font-medium text-xs" style={{ color: '#7A7A8C' }}>{prof?.name}</span>
                            <span className="ml-2 font-mono text-[10px]" style={{ color: '#3A3A46' }}>{app.role}</span>
                          </div>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              background: app.status === 'accepted' ? 'rgba(200,241,53,0.08)' : 'rgba(255,80,80,0.08)',
                              color: app.status === 'accepted' ? '#C8F135' : '#ff6b6b',
                            }}>
                            {app.status === 'accepted' ? '✓ Accepted' : '✕ Declined'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TEAM ── */}
        {members.length > 0 && (
          <div>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>TEAM</h2>
            <div className="flex flex-col gap-2">
              {members.map((m: any) => (
                <Link key={m.handle} href={`/profile/${m.handle}`}
                  className="card-hover flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: '#141416', borderColor: '#2A2A30' }}
                >
                  <Avatar initials={m.avatar || m.name?.slice(0,2) || 'NN'} size="sm" />
                  <div className="flex-1">
                    <span className="font-display font-medium text-sm" style={{ color: '#E8E8F0' }}>{m.name}</span>
                    <span className="ml-2 font-body text-xs" style={{ color: '#7A7A8C' }}>{m.role}</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: '#3A3A46' }}>@{m.handle}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── TASKS ── */}
        {tasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-xs" style={{ color: '#7A7A8C' }}>TASKS</h2>
              <span className="font-mono text-xs" style={{ color: '#C8F135' }}>
                {doneCount}/{tasks.length} done · {progress}%
              </span>
            </div>
            <div className="mb-4">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1C1C20' }}>
                <div className="h-full rounded-full"
                  style={{ width: `${progress}%`, background: 'linear-gradient(to right, #9BB82A, #C8F135)' }} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {tasks.map((task: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: '#141416', borderColor: '#2A2A30' }}>
                  {task.done
                    ? <CheckSquare size={15} style={{ color: '#C8F135', flexShrink: 0 }} />
                    : <Square size={15} style={{ color: '#3A3A46', flexShrink: 0 }} />
                  }
                  <span className="font-body text-sm"
                    style={{ color: task.done ? '#7A7A8C' : '#E8E8F0', textDecoration: task.done ? 'line-through' : 'none' }}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}