'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import ActivityCard from '@/components/ui/ActivityCard';
import { Activity } from '@/lib/data';
import { fetchActivityById, fetchActivities } from '@/lib/actions/activities';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/hooks';
import {
  ArrowLeft, Zap, Trophy, Code2, Rocket, GitMerge,
  Plus, Search, Heart, MessageCircle, Send, Loader2, AlertCircle, Trash2
} from 'lucide-react';

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  earned_xp:         { icon: Zap,      label: 'Skill Mission Completed', color: '#C8F135' },
  joined_project:    { icon: Plus,     label: 'Joined Project',          color: '#C8F135' },
  won_hackathon:     { icon: Trophy,   label: 'Hackathon Win',           color: '#C8F135' },
  deployed:          { icon: Rocket,   label: 'Deployed',                color: '#9BB82A' },
  looking_for:       { icon: Search,   label: 'Looking for Teammate',    color: '#7A7A8C' },
  completed_mission: { icon: Code2,    label: 'Mission Completed',       color: '#C8F135' },
  started_project:   { icon: Plus,     label: 'New Project',             color: '#9BB82A' },
  contributed_oss:   { icon: GitMerge, label: 'Open Source Contribution', color: '#9BB82A' },
};

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { name: string; handle: string; avatar: string; };
}

export default function ActivityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [related, setRelated] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  // Like state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // Comment state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [posting, setPosting] = useState(false);
  const { profile: currentProfile, user: currentUser } = useProfile();
  const [activityOwnerId, setActivityOwnerId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setNotFoundState(false);

      try {
        const supabase = createClient();

        // Fetch activity detail and interactions in parallel
        const [
          item,
          actRowRes,
          lCountRes,
          commDataRes,
          allActivities,
          myLikeRes,
        ] = await Promise.all([
          fetchActivityById(id),
          supabase.from('activities').select('user_id').eq('id', id).single(),
          supabase.from('activity_likes').select('*', { count: 'exact', head: true }).eq('activity_id', id),
          supabase.from('activity_comments').select('*, profiles(name, handle, avatar)').eq('activity_id', id).order('created_at', { ascending: true }),
          fetchActivities(),
          currentUser?.id
            ? supabase.from('activity_likes').select('id').eq('activity_id', id).eq('user_id', currentUser.id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        if (!item) {
          if (isMounted) setNotFoundState(true);
          return;
        }

        if (!isMounted) return;

        setLiked(!!myLikeRes?.data);
        setActivity(item);
        if (actRowRes.data) setActivityOwnerId(actRowRes.data.user_id);
        setLikeCount(lCountRes.count || 0);
        setComments(commDataRes.data || []);

        const rel = (allActivities || []).filter(a => a.id !== id && (
          a.user.college === item.user.college ||
          a.tags?.some(t => item.tags?.includes(t))
        )).slice(0, 3);
        setRelated(rel);
      } catch {
        if (isMounted) setNotFoundState(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    // Sync liked state when currentUser is resolved
    if (currentUser?.id) {
      const supabase = createClient();
      supabase
        .from('activity_likes')
        .select('id')
        .eq('activity_id', id)
        .eq('user_id', currentUser.id)
        .maybeSingle()
        .then((res: { data: { id: string } | null }) => {
          if (isMounted && res.data) {
            setLiked(true);
          }
        });
    }

    // Realtime comments
    const supabase = createClient();
    const channel = supabase
      .channel(`comments-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_comments',
        filter: `activity_id=eq.${id}`,
      }, async (payload: { new: any }) => {
        // Fetch with profile join
        const { data } = await supabase
          .from('activity_comments')
          .select('*, profiles(name, handle, avatar)')
          .eq('id', payload.new.id)
          .single();
        if (data) setComments(prev => [...prev, data]);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'activity_comments',
        filter: `activity_id=eq.${id}`,
      }, (payload: { old: any }) => {
        setComments(prev => prev.filter(c => c.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [id, currentUser?.id]);

  const handleLike = async () => {
    if (liking || !currentUser) return;
    setLiking(true);
    const supabase = createClient();

    if (liked) {
      await supabase
        .from('activity_likes')
        .delete()
        .eq('activity_id', id)
        .eq('user_id', currentUser.id);
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      await supabase.from('activity_likes').insert({
        activity_id: id,
        user_id: currentUser.id,
      });
      setLiked(true);
      setLikeCount(prev => prev + 1);

      // Notify owner
      if (activityOwnerId && activityOwnerId !== currentUser.id) {
        await supabase.from('notifications').insert({
          user_id: activityOwnerId,
          type: 'like',
          title: 'Someone liked your post',
          body: `${currentProfile?.name} liked your activity`,
          link: `/feed/${id}`,
          read: false,
        });
      }
    }
    setLiking(false);
  };

  const handleComment = async () => {
    if (!commentInput.trim() || posting || !currentUser) return;
    setPosting(true);
    const supabase = createClient();

    const { error } = await supabase.from('activity_comments').insert({
      activity_id: id,
      user_id: currentUser.id,
      content: commentInput.trim(),
    });

    if (!error) {
      // Notify owner
      if (activityOwnerId && activityOwnerId !== currentUser.id) {
        await supabase.from('notifications').insert({
          user_id: activityOwnerId,
          type: 'comment',
          title: 'New comment on your post',
          body: `${currentProfile?.name}: ${commentInput.trim().slice(0, 80)}`,
          link: `/feed/${id}`,
          read: false,
        });
      }
      setCommentInput('');
    }
    setPosting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const supabase = createClient();
    await supabase.from('activity_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#0D0D0F' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#C8F135' }} />
        <p className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Loading...</p>
      </div>
    );
  }

  if (notFoundState || !activity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0D0D0F' }}>
        <div className="text-center max-w-md border rounded-2xl p-8" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#F87171' }} />
          <h2 className="font-display font-bold text-xl mb-2" style={{ color: '#E8E8F0' }}>Activity Not Found</h2>
          <p className="font-body text-sm mb-6" style={{ color: '#7A7A8C' }}>
            This activity could not be found. It may have been removed.
          </p>
          <Link href="/feed"
            className="inline-flex items-center gap-2 font-display font-semibold text-xs px-5 py-2.5 rounded-xl"
            style={{ background: '#C8F135', color: '#0D0D0F' }}>
            <ArrowLeft size={14} /> Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const config = typeConfig[activity.type] || typeConfig.earned_xp;
  const Icon = config.icon;

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-40 border-b px-4 md:px-6 h-14 flex items-center gap-4"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <Link href="/feed"
          className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Feed
        </Link>
        <span style={{ color: '#2A2A30' }}>·</span>
        <div className="flex items-center gap-1.5">
          <Icon size={12} style={{ color: config.color }} />
          <span className="font-mono text-xs" style={{ color: config.color }}>{config.label}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        {/* Main card */}
        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          {/* User */}
          <div className="flex items-start gap-4 mb-5">
            <Avatar initials={activity.user.avatar} size="lg" glow />
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg" style={{ color: '#E8E8F0' }}>{activity.user.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Link href={`/profile/${activity.user.handle}`}
                  className="font-mono text-xs transition-colors"
                  style={{ color: '#C8F135' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#d4f547'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#C8F135'; }}
                >
                  @{activity.user.handle}
                </Link>
                <span style={{ color: '#2A2A30' }}>·</span>
                <span className="font-body text-xs" style={{ color: '#7A7A8C' }}>{activity.user.college}</span>
              </div>
            </div>
          </div>

          {/* Content box */}
          <div className="rounded-xl p-5 mb-5" style={{ background: '#1C1C20', border: '1px solid #2A2A30' }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} style={{ color: config.color }} />
              <span className="font-mono text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
              <span className="ml-auto font-mono text-xs" style={{ color: '#3A3A46' }}>{activity.timestamp}</span>
            </div>
            <p className="font-body text-base leading-relaxed" style={{ color: '#E8E8F0' }}>
              {activity.user.name}{' '}
              <span style={{ color: '#C8F135' }}>{activity.content}</span>
              {activity.xp && (
                <span className="inline-flex items-center gap-1 font-mono text-sm ml-2 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135' }}>
                  +{activity.xp} XP
                </span>
              )}
            </p>
            {activity.meta && (
              <p className="font-body text-sm mt-2" style={{ color: '#7A7A8C' }}>{activity.meta}</p>
            )}
          </div>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {activity.tags.map(tag => <Tag key={tag} label={tag} variant="dim" />)}
            </div>
          )}

          {/* Like + comment count */}
          <div className="flex items-center gap-5 py-4 border-t border-b" style={{ borderColor: '#2A2A30' }}>
            <button
              onClick={handleLike}
              disabled={liking || !currentUser}
              className="flex items-center gap-2 transition-all duration-150"
              style={{ color: liked ? '#C8F135' : '#7A7A8C' }}
              onMouseEnter={e => { if (!liked) e.currentTarget.style.color = '#E8E8F0'; }}
              onMouseLeave={e => { if (!liked) e.currentTarget.style.color = '#7A7A8C'; }}
            >
              <Heart size={16} fill={liked ? '#C8F135' : 'none'} style={{ color: liked ? '#C8F135' : 'inherit' }} />
              <span className="font-mono text-xs">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
            </button>
            <div className="flex items-center gap-2" style={{ color: '#7A7A8C' }}>
              <MessageCircle size={16} />
              <span className="font-mono text-xs">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="rounded-2xl border p-5 mb-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <h3 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>
            COMMENTS {comments.length > 0 && `· ${comments.length}`}
          </h3>

          {/* Comment list */}
          {comments.length > 0 && (
            <div className="flex flex-col gap-3 mb-4">
              {comments.map(comment => {
                const isMe = comment.user_id === currentUser?.id;
                const prof = Array.isArray(comment.profiles)
                  ? comment.profiles[0]
                  : comment.profiles;
                return (
                  <div key={comment.id}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: '#1C1C20', border: '1px solid #2A2A30' }}>
                    <Avatar
                      initials={prof?.avatar || prof?.name?.slice(0,2).toUpperCase() || 'NN'}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/profile/${prof?.handle}`}
                          className="font-mono text-[11px] transition-colors"
                          style={{ color: '#C8F135' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#d4f547'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#C8F135'; }}
                        >
                          @{prof?.handle}
                        </Link>
                        <span className="font-mono text-[10px]" style={{ color: '#3A3A46' }}>
                          {timeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="font-body text-sm" style={{ color: '#E8E8F0' }}>{comment.content}</p>
                    </div>
                    {isMe && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex-shrink-0 p-1 rounded transition-all"
                        style={{ color: '#3A3A46' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#3A3A46'; }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {comments.length === 0 && (
            <p className="font-body text-xs mb-4 text-center py-4" style={{ color: '#3A3A46' }}>
              No comments yet. Be the first to reply.
            </p>
          )}

          {/* Comment input */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Avatar
                initials={currentProfile?.avatar || currentProfile?.name?.slice(0,2).toUpperCase() || 'NN'}
                size="sm"
              />
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                  className="flex-1 h-9 px-3 rounded-xl font-body text-sm outline-none transition-all"
                  style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                  onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
                  onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  onClick={handleComment}
                  disabled={!commentInput.trim() || posting}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: commentInput.trim() && !posting ? '#C8F135' : '#1C1C20',
                    color: commentInput.trim() && !posting ? '#0D0D0F' : '#3A3A46',
                  }}
                  onMouseEnter={e => { if (commentInput.trim() && !posting) e.currentTarget.style.background = '#d4f547'; }}
                  onMouseLeave={e => { if (commentInput.trim() && !posting) e.currentTarget.style.background = '#C8F135'; }}
                >
                  {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          ) : (
            <p className="font-body text-xs text-center" style={{ color: '#3A3A46' }}>
              <Link href="/auth" style={{ color: '#C8F135' }}>Sign in</Link> to comment
            </p>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h3 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>MORE FROM THIS CAMPUS & STACK</h3>
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