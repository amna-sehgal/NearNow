// src/app/(app)/profile/[handle]/page.tsx
'use client';
import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PROFILES, PROJECTS } from '@/lib/mock';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import ActivityCard from '@/components/ui/ActivityCard';
import { ACTIVITIES } from '@/lib/data';
import {Globe, MapPin, GraduationCap,
  Edit3, Star, Zap, Trophy, GitMerge, ExternalLink
} from 'lucide-react';

function GithubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}
function LinkedinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl border" style={{ background: '#141416', borderColor: '#2A2A30' }}>
      <span className="font-display font-bold text-xl" style={{ color: '#C8F135' }}>{value}</span>
      <span className="font-mono text-[10px] mt-0.5" style={{ color: '#7A7A8C' }}>{label}</span>
    </div>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const profile = PROFILES[handle];
  if (!profile) notFound();

  const isMe = handle === 'amna_s'; // swap with real auth
  const userProjects = PROJECTS.filter(p => p.members.some(m => m.handle === handle));
  const userActivity = ACTIVITIES.filter(a => a.user.handle === handle);

  const xpPercent = Math.min((profile.xp / profile.xpToNext) * 100, 100);

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      {/* Header bar */}
      <header
        className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center justify-between"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>@{profile.handle}</span>
        {isMe && (
          <Link
            href="/profile/edit"
            className="flex items-center gap-2 h-8 px-3 rounded-lg font-body text-xs transition-all"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#7A7A8C' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
          >
            <Edit3 size={12} /> Edit profile
          </Link>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        {/* ── IDENTITY CARD ── */}
        <div className="rounded-2xl border p-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <div className="flex items-start gap-4 mb-5">
            <Avatar initials={profile.avatar} size="lg" glow />
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl" style={{ color: '#E8E8F0' }}>{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="font-mono text-xs" style={{ color: '#C8F135' }}>@{profile.handle}</span>
                <span style={{ color: '#2A2A30' }}>·</span>
                <span className="flex items-center gap-1 font-body text-xs" style={{ color: '#7A7A8C' }}>
                  <GraduationCap size={11} /> {profile.college}
                </span>
                <span style={{ color: '#2A2A30' }}>·</span>
                <span className="flex items-center gap-1 font-body text-xs" style={{ color: '#7A7A8C' }}>
                  <MapPin size={11} /> {profile.location}
                </span>
              </div>
              <p className="font-body text-xs mt-1" style={{ color: '#7A7A8C' }}>{profile.year}</p>
            </div>

            {/* Reputation badge */}
            <div className="flex-shrink-0 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border"
                style={{ background: 'rgba(200,241,53,0.06)', borderColor: 'rgba(200,241,53,0.2)' }}
              >
                <Star size={14} style={{ color: '#C8F135' }} />
                <span className="font-display font-bold text-lg leading-tight" style={{ color: '#C8F135' }}>{profile.reputation}</span>
              </div>
              <span className="font-mono text-[9px] mt-1 block" style={{ color: '#7A7A8C' }}>REP</span>
            </div>
          </div>

          {/* Bio */}
          <p className="font-body text-sm leading-relaxed mb-5" style={{ color: '#E8E8F0' }}>{profile.bio}</p>

          {/* XP bar */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>XP Progress</span>
              <span className="font-mono text-xs" style={{ color: '#C8F135' }}>{profile.xp} / {profile.xpToNext}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1C1C20' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${xpPercent}%`, background: 'linear-gradient(to right, #9BB82A, #C8F135)', transition: 'width 1s ease' }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <StatPill value={profile.stats.projects} label="Projects" />
            <StatPill value={profile.stats.missions} label="Missions" />
            <StatPill value={profile.stats.hackathons} label="Hackathons" />
            <StatPill value={profile.stats.contributions} label="Contributions" />
          </div>

          {/* Links */}
          <div className="flex gap-3 flex-wrap">
            {profile.links.github && (
              <a href={`https://${profile.links.github}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >
                <GithubIcon /> GitHub
              </a>
            )}
            {profile.links.linkedin && (
              <a href={`https://${profile.links.linkedin}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >
                <LinkedinIcon /> LinkedIn
              </a>
            )}
            {profile.links.portfolio && (
              <a href={`https://${profile.links.portfolio}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >
                <Globe size={12} /> Portfolio
              </a>
            )}
            {!isMe && (
              <button
                className="ml-auto flex items-center gap-1.5 font-display font-medium text-xs px-4 py-1.5 rounded-lg transition-all"
                style={{ background: '#C8F135', color: '#0D0D0F' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* ── BADGES ── */}
        {profile.badges.length > 0 && (
          <div className="rounded-2xl border p-5" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>BADGES</h2>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map(b => (
                <div
                  key={b.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border font-body text-xs"
                  style={{ background: '#1C1C20', borderColor: '#2A2A30', color: '#E8E8F0' }}
                >
                  <span>{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SKILLS + LOOKING FOR ── */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(s => <Tag key={s} label={s} variant="dim" />)}
            </div>
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>LOOKING TO COLLABORATE WITH</h2>
            <div className="flex flex-wrap gap-2">
              {profile.lookingFor.map(r => <Tag key={r} label={r} variant="volt" />)}
            </div>
          </div>
        </div>

        {/* ── CURRENT PROJECTS ── */}
        {userProjects.length > 0 && (
          <div>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>PROJECTS</h2>
            <div className="flex flex-col gap-3">
              {userProjects.map(project => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="card-hover flex items-start gap-4 p-4 rounded-xl border"
                  style={{ background: '#141416', borderColor: '#2A2A30' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>{project.name}</span>
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: project.status === 'active' ? 'rgba(200,241,53,0.1)' : '#1C1C20',
                          color: project.status === 'active' ? '#C8F135' : '#7A7A8C',
                          border: `1px solid ${project.status === 'active' ? 'rgba(200,241,53,0.2)' : '#2A2A30'}`,
                        }}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="font-body text-xs mb-2" style={{ color: '#7A7A8C' }}>{project.tagline}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.stack.slice(0, 4).map(s => <Tag key={s} label={s} />)}
                    </div>
                  </div>
                  <ExternalLink size={14} style={{ color: '#3A3A46', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── RECENT ACTIVITY ── */}
        {userActivity.length > 0 && (
          <div>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>RECENT ACTIVITY</h2>
            <div className="flex flex-col gap-3">
              {userActivity.map(a => <ActivityCard key={a.id} activity={a} />)}
            </div>
          </div>
        )}

        {userActivity.length === 0 && (
          <div className="text-center py-12 rounded-2xl border" style={{ borderColor: '#2A2A30', background: '#141416' }}>
            <p className="font-display text-base" style={{ color: '#3A3A46' }}>No activity yet.</p>
            <p className="font-body text-xs mt-1" style={{ color: '#3A3A46' }}>Complete a mission or join a project to appear in the feed.</p>
          </div>
        )}
      </main>
    </div>
  );
}