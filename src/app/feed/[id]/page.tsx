'use client';
import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ACTIVITIES } from '@/lib/data';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import ActivityCard from '@/components/ui/ActivityCard';
import { ArrowLeft, Zap, Trophy, Code2, Rocket, GitMerge, Plus, Search, ExternalLink, UserPlus } from 'lucide-react';

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  earned_xp:        { icon: Zap,      label: 'Skill Mission Completed', color: '#C8F135' },
  joined_project:   { icon: Plus,     label: 'Joined Project',          color: '#C8F135' },
  won_hackathon:    { icon: Trophy,   label: 'Hackathon Win',           color: '#C8F135' },
  deployed:         { icon: Rocket,   label: 'Deployed',                color: '#9BB82A' },
  looking_for:      { icon: Search,   label: 'Looking for Teammate',    color: '#7A7A8C' },
  completed_mission:{ icon: Code2,    label: 'Mission Completed',       color: '#C8F135' },
  started_project:  { icon: Plus,     label: 'New Project',             color: '#9BB82A' },
  contributed_oss:  { icon: GitMerge, label: 'Open Source Contribution', color: '#9BB82A' },
};

export default function ActivityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const activity = ACTIVITIES.find(a => a.id === id);
  if (!activity) notFound();

  const config = typeConfig[activity.type] || typeConfig.earned_xp;
  const Icon = config.icon;

  const related = ACTIVITIES.filter(a => a.id !== activity.id && (
    a.tags?.some(t => activity.tags?.includes(t)) || a.user.college === activity.user.college
  )).slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      {/* Header */}
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
        <div className="flex items-center gap-1.5">
          <Icon size={12} style={{ color: config.color }} />
          <span className="font-mono text-xs" style={{ color: config.color }}>{config.label}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        {/* Main card */}
        <div
          className="rounded-2xl border p-6 mb-8"
          style={{ background: '#141416', borderColor: '#2A2A30' }}
        >
          {/* User info */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar initials={activity.user.avatar} size="lg" glow />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-lg" style={{ color: '#E8E8F0' }}>
                    {activity.user.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs" style={{ color: '#C8F135' }}>
                      @{activity.user.handle}
                    </span>
                    <span style={{ color: '#2A2A30' }}>·</span>
                    <span className="font-body text-xs" style={{ color: '#7A7A8C' }}>
                      {activity.user.college}
                    </span>
                  </div>
                </div>
                <button
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg font-display font-medium text-xs transition-all duration-200"
                  style={{ background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.2)', color: '#C8F135' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,241,53,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,241,53,0.1)'; }}
                >
                  <UserPlus size={12} />
                  Connect
                </button>
              </div>
            </div>
          </div>

          {/* Activity content */}
          <div
            className="rounded-xl p-5 mb-5"
            style={{ background: '#1C1C20', border: '1px solid #2A2A30' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} style={{ color: config.color }} />
              <span className="font-mono text-xs font-medium" style={{ color: config.color }}>
                {config.label}
              </span>
              <span className="ml-auto font-mono text-xs" style={{ color: '#3A3A46' }}>
                {activity.timestamp}
              </span>
            </div>
            <p className="font-body text-base leading-relaxed" style={{ color: '#E8E8F0' }}>
              {activity.user.name} <span style={{ color: '#C8F135' }}>{activity.content}</span>
              {activity.xp && (
                <span
                  className="inline-flex items-center gap-1 font-mono text-sm ml-2 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135' }}
                >
                  +{activity.xp} XP
                </span>
              )}
            </p>
            {activity.meta && (
              <p className="font-body text-sm mt-2" style={{ color: '#7A7A8C' }}>
                {activity.meta}
              </p>
            )}
          </div>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activity.tags.map(tag => <Tag key={tag} label={tag} variant="dim" />)}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-5 border-t" style={{ borderColor: '#2A2A30' }}>
            {activity.type === 'looking_for' && (
              <button
                className="flex-1 h-10 rounded-xl font-display font-semibold text-sm transition-all duration-200"
                style={{ background: '#C8F135', color: '#0D0D0F' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
              >
                Apply to join project
              </button>
            )}
            {activity.type === 'started_project' || activity.type === 'joined_project' ? (
              <button
                className="flex-1 h-10 rounded-xl font-display font-semibold text-sm transition-all duration-200"
                style={{ background: '#C8F135', color: '#0D0D0F' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
              >
                View project
              </button>
            ) : null}
            <button
              className="flex items-center gap-2 h-10 px-4 rounded-xl font-body text-sm transition-all duration-200"
              style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#7A7A8C' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#3A3A44';
                e.currentTarget.style.color = '#E8E8F0';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2A2A30';
                e.currentTarget.style.color = '#7A7A8C';
              }}
            >
              <ExternalLink size={13} />
              Share
            </button>
          </div>
        </div>

        {/* Related activity */}
        {related.length > 0 && (
          <div>
            <h3 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>
              MORE FROM THIS CAMPUS & STACK
            </h3>
            <div className="flex flex-col gap-3">
              {related.map(a => (
                <Link key={a.id} href={`/feed/${a.id}`}>
                  <ActivityCard activity={a} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
