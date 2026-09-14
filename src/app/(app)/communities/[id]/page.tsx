'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchCommunityById,
  fetchCommunityPosts,
  fetchCommunityMembers,
  joinCommunityAction,
  leaveCommunityAction,
  createCommunityPostAction,
  Community,
  CommunityPost,
} from '@/lib/actions/communities';
import { UserProfile } from '@/lib/mock';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { Users, Check, Plus, MessageSquare, Send, Heart, ArrowLeft, Shield } from 'lucide-react';

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postError, setPostError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'discussions' | 'members'>('discussions');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const [cData, pData, mData] = await Promise.all([
        fetchCommunityById(id),
        fetchCommunityPosts(id),
        fetchCommunityMembers(id),
      ]);
      if (isMounted) {
        setCommunity(cData);
        setPosts(pData);
        setMembers(mData);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  const handleToggleJoin = async () => {
    if (!community) return;
    setJoining(true);
    if (community.isJoined) {
      await leaveCommunityAction(community.id);
      setCommunity({ ...community, isJoined: false, membersCount: community.membersCount - 1 });
    } else {
      await joinCommunityAction(community.id);
      setCommunity({ ...community, isJoined: true, membersCount: community.membersCount + 1 });
    }
    setJoining(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community) return;
    setPostError('');
    setSubmittingPost(true);

    const res = await createCommunityPostAction({
      communityId: community.id,
      title: postTitle,
      content: postContent,
    });

    setSubmittingPost(false);
    if (res.error) {
      setPostError(res.error);
    } else {
      setPostTitle('');
      setPostContent('');
      // Reload posts
      const pData = await fetchCommunityPosts(community.id);
      setPosts(pData);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0F' }}>
      <div className="font-mono text-sm" style={{ color: '#7A7A8C' }}>Loading community...</div>
    </div>
  );

  if (!community) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0F' }}>
      <div className="text-center">
        <p className="font-display text-lg" style={{ color: '#3A3A46' }}>Community not found.</p>
        <Link href="/communities" className="font-mono text-xs mt-2 block" style={{ color: '#7A7A8C' }}>← Back to communities</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-16" style={{ background: '#0D0D0F' }}>
      {/* Header Bar */}
      <header className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center justify-between"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <Link href="/communities" className="flex items-center gap-2 font-mono text-xs" style={{ color: '#7A7A8C' }}>
          <ArrowLeft size={14} /> Back to Communities
        </Link>
        <span className="font-mono text-xs" style={{ color: '#C8F135' }}>{community.category}</span>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        {/* Banner Card */}
        <div className="rounded-2xl border p-6 md:p-8" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: '#1C1C20', borderColor: '#2A2A30' }}>
                {community.avatar}
              </div>

              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: '#E8E8F0' }}>
                  {community.name}
                </h1>
                <div className="flex items-center gap-3 mt-1.5 font-mono text-xs" style={{ color: '#7A7A8C' }}>
                  <span>👥 {community.membersCount} Builders</span>
                  <span>·</span>
                  <span>💬 {community.postsCount} Discussions</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleJoin}
              disabled={joining}
              className="flex items-center justify-center gap-1.5 font-display font-semibold text-sm px-6 py-2.5 rounded-xl transition-all self-start"
              style={{
                background: community.isJoined ? '#1C1C20' : '#C8F135',
                color: community.isJoined ? '#C8F135' : '#0D0D0F',
                border: community.isJoined ? '1px solid rgba(200,241,53,0.3)' : 'none',
              }}
            >
              {joining ? (
                'Updating...'
              ) : community.isJoined ? (
                <><Check size={16} /> Joined Community</>
              ) : (
                <><Plus size={16} /> Join Community</>
              )}
            </button>
          </div>

          <p className="font-body text-sm leading-relaxed mb-6" style={{ color: '#E8E8F0' }}>
            {community.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {community.tags?.map(t => <Tag key={t} label={t} variant="volt" />)}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b gap-6" style={{ borderColor: '#2A2A30' }}>
          <button
            onClick={() => setActiveTab('discussions')}
            className="pb-3 font-display font-medium text-sm border-b-2 transition-all flex items-center gap-2"
            style={{
              color: activeTab === 'discussions' ? '#C8F135' : '#7A7A8C',
              borderColor: activeTab === 'discussions' ? '#C8F135' : 'transparent',
            }}
          >
            <MessageSquare size={16} /> Discussions ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className="pb-3 font-display font-medium text-sm border-b-2 transition-all flex items-center gap-2"
            style={{
              color: activeTab === 'members' ? '#C8F135' : '#7A7A8C',
              borderColor: activeTab === 'members' ? '#C8F135' : 'transparent',
            }}
          >
            <Users size={16} /> Members ({members.length})
          </button>
        </div>

        {/* Tab 1: Discussions */}
        {activeTab === 'discussions' && (
          <div className="flex flex-col gap-6">
            {/* Create Post Box */}
            <div className="rounded-2xl border p-5" style={{ background: '#141416', borderColor: '#2A2A30' }}>
              <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#E8E8F0' }}>
                Start a Discussion
              </h3>

              {postError && (
                <div className="p-3 mb-3 rounded-xl font-body text-xs border" style={{ background: 'rgba(255,107,107,0.1)', borderColor: '#ff6b6b', color: '#ff6b6b' }}>
                  {postError}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl font-body text-xs focus:outline-none"
                  style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                />

                <textarea
                  rows={3}
                  required
                  placeholder="Share code snippet, question, project update, or technical idea..."
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl font-body text-xs focus:outline-none"
                  style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="flex items-center gap-1.5 font-display font-medium text-xs px-4 py-2 rounded-xl transition-all"
                    style={{ background: '#C8F135', color: '#0D0D0F' }}
                  >
                    <Send size={12} /> {submittingPost ? 'Posting...' : 'Post to Community'}
                  </button>
                </div>
              </form>
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border" style={{ borderColor: '#2A2A30', background: '#141416' }}>
                <p className="font-display text-base" style={{ color: '#E8E8F0' }}>No discussions yet.</p>
                <p className="font-body text-xs mt-1" style={{ color: '#7A7A8C' }}>Be the first builder to post in {community.name}!</p>
              </div>
            ) : (
              posts.map(p => (
                <div key={p.id} className="p-5 rounded-2xl border flex flex-col gap-3" style={{ background: '#141416', borderColor: '#2A2A30' }}>
                  <div className="flex items-center gap-3">
                    <Avatar initials={p.author.avatar || p.author.name.slice(0, 2).toUpperCase()} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${p.author.handle}`} className="font-display font-semibold text-sm hover:underline" style={{ color: '#E8E8F0' }}>
                          {p.author.name}
                        </Link>
                        <span className="font-mono text-xs" style={{ color: '#C8F135' }}>@{p.author.handle}</span>
                      </div>
                      <div className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>
                        🎓 {p.author.college} · {p.createdAt}
                      </div>
                    </div>
                  </div>

                  {p.title && <h4 className="font-display font-bold text-base" style={{ color: '#E8E8F0' }}>{p.title}</h4>}

                  <p className="font-body text-sm leading-relaxed" style={{ color: '#E8E8F0' }}>
                    {p.content}
                  </p>

                  <div className="flex items-center gap-4 pt-2 border-t font-mono text-xs" style={{ borderColor: '#2A2A30', color: '#7A7A8C' }}>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <Heart size={14} /> {p.likesCount} Likes
                    </button>
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <MessageSquare size={14} /> Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'members' && (
          <div className="grid md:grid-cols-2 gap-4">
            {members.map((m, idx) => (
              <div key={m.handle} className="card-hover p-4 rounded-xl border flex items-center justify-between"
                style={{ background: '#141416', borderColor: '#2A2A30' }}>
                <div className="flex items-center gap-3">
                  <Avatar initials={m.avatar || m.name.slice(0, 2).toUpperCase()} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${m.handle}`} className="font-display font-semibold text-sm hover:underline" style={{ color: '#E8E8F0' }}>
                        {m.name}
                      </Link>
                      {idx === 0 && (
                        <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135' }}>
                          <Shield size={10} /> Admin
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs" style={{ color: '#7A7A8C' }}>
                      🎓 {m.college} · ★ {m.reputation} Rep
                    </div>
                  </div>
                </div>

                <Link
                  href={`/profile/${m.handle}`}
                  className="font-display font-medium text-xs px-3 py-1.5 rounded-lg border transition-all"
                  style={{ background: '#1C1C20', borderColor: '#2A2A30', color: '#E8E8F0' }}
                >
                  Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
