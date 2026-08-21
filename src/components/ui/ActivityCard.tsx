'use client';
import Avatar from './Avatar';
import Tag from './Tag';
import { Activity } from '@/lib/data';
import { Zap, Trophy, Rocket, Code2, Search, GitMerge, Plus } from 'lucide-react';

const typeConfig = {
  earned_xp:        { icon: Zap,      label: 'Skill Mission', color: '#C8F135' },
  joined_project:   { icon: Plus,     label: 'Joined',        color: '#C8F135' },
  won_hackathon:    { icon: Trophy,   label: 'Won',           color: '#C8F135' },
  deployed:         { icon: Rocket,   label: 'Deployed',      color: '#9BB82A' },
  looking_for:      { icon: Search,   label: 'Looking',       color: '#7A7A8C' },
  completed_mission:{ icon: Code2,    label: 'Mission',       color: '#C8F135' },
  started_project:  { icon: Plus,     label: 'New Project',   color: '#9BB82A' },
  contributed_oss:  { icon: GitMerge, label: 'Open Source',   color: '#9BB82A' },
};

interface ActivityCardProps {
  activity: Activity;
  blurred?: boolean;
  delay?: number;
}

export default function ActivityCard({ activity, blurred, delay = 0 }: ActivityCardProps) {
  const config = typeConfig[activity.type];
  const Icon = config.icon;

  return (
    <div
      className={`volt-left-bar ${activity.isFresh ? 'fresh' : ''} card-hover relative bg-[#141416] border border-[#2A2A30] rounded-xl pl-6 pr-5 py-4 cursor-pointer`}
      style={{
        animationDelay: `${delay}ms`,
        filter: blurred ? 'blur(4px)' : 'none',
        userSelect: blurred ? 'none' : 'auto',
        pointerEvents: blurred ? 'none' : 'auto',
      }}
    >
      <div className="flex items-start gap-3">
        <Avatar initials={activity.user.avatar} size="md" />
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs" style={{ color: config.color }}>
              {activity.user.handle}
            </span>
            <span className="text-[#3A3A46] text-xs">·</span>
            <span className="text-[#7A7A8C] text-xs">{activity.user.college}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <Icon size={11} style={{ color: config.color }} />
              <span className="font-mono text-[10px]" style={{ color: config.color }}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Content */}
          <p className="text-[#E8E8F0] text-sm font-body mb-1 leading-snug">
            <span className="font-display font-medium">{activity.user.name}</span>
            {' '}{activity.content}
            {activity.xp && (
              <span className="font-mono text-xs ml-2" style={{ color: '#C8F135' }}>
                +{activity.xp} XP
              </span>
            )}
          </p>

          {/* Meta */}
          {activity.meta && (
            <p className="text-[#7A7A8C] text-xs mb-2 font-body">{activity.meta}</p>
          )}

          {/* Tags + timestamp */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {activity.tags?.map(tag => <Tag key={tag} label={tag} />)}
            <span className="ml-auto font-mono text-[10px] text-[#3A3A46]">
              {activity.timestamp}
            </span>
          </div>
        </div>
      </div>

      {/* Fresh indicator */}
      {activity.isFresh && (
        <div
          className="pulse-dot absolute top-4 right-4 w-1.5 h-1.5 rounded-full"
          style={{ background: '#C8F135' }}
        />
      )}
    </div>
  );
}
