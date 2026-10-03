'use client';
import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import Tag from './Tag';
import { Activity } from '@/lib/data';
import { Zap, Trophy, Rocket, Code2, Search, GitMerge, Plus, Heart, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const typeConfig = {
  earned_xp:         { icon: Zap,      label: 'Skill Mission', color: '#C8F135' },
  joined_project:    { icon: Plus,     label: 'Joined',        color: '#C8F135' },
  won_hackathon:     { icon: Trophy,   label: 'Won',           color: '#C8F135' },
  deployed:          { icon: Rocket,   label: 'Deployed',      color: '#9BB82A' },
  looking_for:       { icon: Search,   label: 'Looking',       color: '#7A7A8C' },
  completed_mission: { icon: Code2,    label: 'Mission',       color: '#C8F135' },
  started_project:   { icon: Plus,     label: 'New Project',   color: '#9BB82A' },
  contributed_oss:   { icon: GitMerge, label: 'Open Source',   color: '#9BB82A' },
};

interface ActivityCardProps {
  activity: Activity;
  blurred?: boolean;
  delay?: number;
  showLikes?: boolean;
}

export default function ActivityCard({ activity, blurred, delay = 0, showLikes = true }: ActivityCardProps) {
  const config = typeConfig[activity.type as keyof typeof typeConfig] || typeConfig.earned_xp;
  const Icon = config.icon;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (blurred || !showLikes) return;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Get like count
      const { count: lCount } = await supabase
        .from('activity_likes')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activity.id);
      setLikeCount(lCount || 0);

      // Get comment count
      const { count: cCount } = await supabase
        .from('activity_comments')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activity.id);
      setCommentCount(cCount || 0);

      // Check if current user liked
      if (user) {
        const { data: myLike } = await supabase
          .from('activity_likes')
          .select('id')
          .eq('activity_id', activity.id)
          .eq('user_id', user.id)
          .maybeSingle();
        setLiked(!!myLike);
      }
    };
    load();
  }, [activity.id, blurred, showLikes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liking) return;
    setLiking(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLiking(false); return; }

    if (liked) {
      // Unlike
      await supabase
        .from('activity_likes')
        .delete()
        .eq('activity_id', activity.id)
        .eq('user_id', user.id);
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      // Like
      await supabase.from('activity_likes').insert({
        activity_id: activity.id,
        user_id: user.id,
      });
      setLiked(true);
      setLikeCount(prev => prev + 1);

      // Notify post owner — get owner first
      const { data: activityRow } = await supabase
        .from('activities')
        .select('user_id, content')
        .eq('id', activity.id)
        .single();

      if (activityRow && activityRow.user_id !== user.id) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('name, handle')
          .eq('id', user.id)
          .single();

        await supabase.from('notifications').insert({
          user_id: activityRow.user_id,
          type: 'like',
          title: 'Someone liked your post',
          body: `${myProfile?.name} liked: ${activity.content?.slice(0, 60)}${activity.content?.length > 60 ? '...' : ''}`,
          link: `/feed/${activity.id}`,
          read: false,
        });
      }
    }
    setLiking(false);
  };

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
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {activity.tags?.map(tag => <Tag key={tag} label={tag} />)}
            <span className="ml-auto font-mono text-[10px] text-[#3A3A46]">
              {activity.timestamp}
            </span>
          </div>

          {/* Like + Comment row */}
          {showLikes && !blurred && (
            <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: '#1C1C20' }}>
              {/* Like button */}
              <button
                onClick={handleLike}
                disabled={liking}
                className="flex items-center gap-1.5 transition-all duration-150 group"
                style={{ color: liked ? '#C8F135' : '#3A3A46' }}
                onMouseEnter={e => { if (!liked) e.currentTarget.style.color = '#7A7A8C'; }}
                onMouseLeave={e => { if (!liked) e.currentTarget.style.color = '#3A3A46'; }}
              >
                <Heart
                  size={14}
                  fill={liked ? '#C8F135' : 'none'}
                  style={{ color: liked ? '#C8F135' : 'inherit', transition: 'all 0.15s' }}
                />
                <span className="font-mono text-[11px]">{likeCount > 0 ? likeCount : ''}</span>
              </button>

              {/* Comment count — click goes to detail */}
              <div className="flex items-center gap-1.5" style={{ color: '#3A3A46' }}>
                <MessageCircle size={14} />
                <span className="font-mono text-[11px]">{commentCount > 0 ? commentCount : ''}</span>
              </div>
            </div>
          )}
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