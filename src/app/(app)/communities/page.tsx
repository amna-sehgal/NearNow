'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchCommunities,
  joinCommunityAction,
  leaveCommunityAction,
  createCommunityAction,
  Community,
} from '@/lib/actions/communities';
import Tag from '@/components/ui/Tag';
import { Users, Search, Plus, Check, X } from 'lucide-react';

const CATEGORIES = ['All', 'Web Dev', 'AI / ML', 'Open Source', 'DevOps', 'Design', 'Web3'];

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Community['category']>('Web Dev');
  const [avatar, setAvatar] = useState('⚛️');
  const [tagInput, setTagInput] = useState('React, Web3, OpenSource');
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const data = await fetchCommunities(selectedCategory, search);
      if (isMounted) {
        setCommunities(data);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [selectedCategory, search]);

  const handleToggleJoin = async (c: Community) => {
    setJoiningId(c.id);
    if (c.isJoined) {
      await leaveCommunityAction(c.id);
      setCommunities(prev => prev.map(item => item.id === c.id ? { ...item, isJoined: false, membersCount: item.membersCount - 1 } : item));
    } else {
      await joinCommunityAction(c.id);
      setCommunities(prev => prev.map(item => item.id === c.id ? { ...item, isJoined: true, membersCount: item.membersCount + 1 } : item));
    }
    setJoiningId(null);
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);

    const tagsArr = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    const res = await createCommunityAction({
      name,
      description,
      category,
      avatar,
      tags: tagsArr,
    });

    setCreating(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setIsModalOpen(false);
      setName('');
      setDescription('');
      // Reload communities
      const data = await fetchCommunities(selectedCategory, search);
      setCommunities(data);
    }
  };

  return (
    <div className="min-h-screen pb-16" style={{ background: '#0D0D0F' }}>
      {/* Header */}
      <header className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center justify-between"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <div className="flex items-center gap-2">
          <Users size={18} style={{ color: '#C8F135' }} />
          <h1 className="font-display font-semibold text-base" style={{ color: '#E8E8F0' }}>
            Communities
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 font-display font-medium text-xs px-3.5 py-1.5 rounded-xl transition-all"
          style={{ background: '#C8F135', color: '#0D0D0F' }}
        >
          <Plus size={14} /> Launch Community
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: '#C8F135' }} />
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#7A7A8C' }}>
              Student Hubs
            </span>
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl" style={{ color: '#E8E8F0' }}>
            Student Developer & Builder Guilds
          </h2>
          <p className="font-body text-sm mt-1 max-w-2xl" style={{ color: '#7A7A8C' }}>
            Connect with tech circles across Indian colleges. Join discussions, share technical knowledge, and collaborate on real projects.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap px-4 py-2 rounded-xl font-mono text-xs transition-all"
                  style={{
                    background: active ? 'rgba(200,241,53,0.12)' : '#141416',
                    color: active ? '#C8F135' : '#7A7A8C',
                    border: active ? '1px solid #C8F135' : '1px solid #2A2A30',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-3" style={{ color: '#7A7A8C' }} />
            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl font-body text-xs focus:outline-none transition-all"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            />
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="py-16 text-center font-mono text-sm" style={{ color: '#7A7A8C' }}>
            Loading communities...
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{ borderColor: '#2A2A30', background: '#141416' }}>
            <p className="font-display text-base" style={{ color: '#E8E8F0' }}>No communities found.</p>
            <p className="font-body text-xs mt-1" style={{ color: '#7A7A8C' }}>Try searching another category or launch a new community.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communities.map(c => (
              <div
                key={c.id}
                className="card-hover p-6 rounded-2xl border flex flex-col justify-between"
                style={{ background: '#141416', borderColor: '#2A2A30' }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl"
                      style={{ background: '#1C1C20', borderColor: '#2A2A30' }}>
                      {c.avatar}
                    </div>

                    <button
                      onClick={() => handleToggleJoin(c)}
                      disabled={joiningId === c.id}
                      className="flex items-center gap-1 font-display font-medium text-xs px-3.5 py-1.5 rounded-xl transition-all"
                      style={{
                        background: c.isJoined ? '#1C1C20' : '#C8F135',
                        color: c.isJoined ? '#C8F135' : '#0D0D0F',
                        border: c.isJoined ? '1px solid rgba(200,241,53,0.3)' : 'none',
                      }}
                    >
                      {joiningId === c.id ? (
                        'Updating...'
                      ) : c.isJoined ? (
                        <><Check size={12} /> Joined</>
                      ) : (
                        <><Plus size={12} /> Join</>
                      )}
                    </button>
                  </div>

                  <Link href={`/communities/${c.id}`} className="font-display font-bold text-lg hover:underline block mb-1" style={{ color: '#E8E8F0' }}>
                    {c.name}
                  </Link>

                  <span className="inline-block font-mono text-[10px] px-2 py-0.5 rounded-full mb-3"
                    style={{ background: 'rgba(200,241,53,0.08)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.15)' }}>
                    {c.category}
                  </span>

                  <p className="font-body text-xs leading-relaxed mb-4 line-clamp-3" style={{ color: '#7A7A8C' }}>
                    {c.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {c.tags?.map(t => <Tag key={t} label={t} />)}
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: '#2A2A30' }}>
                  <div className="flex items-center gap-3 font-mono text-xs" style={{ color: '#7A7A8C' }}>
                    <span>👥 {c.membersCount} members</span>
                    <span>💬 {c.postsCount} posts</span>
                  </div>

                  <Link
                    href={`/communities/${c.id}`}
                    className="font-display font-medium text-xs"
                    style={{ color: '#C8F135' }}
                  >
                    View Guild →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Launch Community Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-5 relative" style={{ background: '#141416', borderColor: '#2A2A30' }}>
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4" style={{ color: '#7A7A8C' }}>
              <X size={18} />
            </button>

            <div>
              <h3 className="font-display font-bold text-xl" style={{ color: '#E8E8F0' }}>Launch a Community</h3>
              <p className="font-body text-xs mt-1" style={{ color: '#7A7A8C' }}>Build a hub for builders in your college or stack.</p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl font-body text-xs border" style={{ background: 'rgba(255,107,107,0.1)', borderColor: '#ff6b6b', color: '#ff6b6b' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCommunity} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-xs block mb-1" style={{ color: '#7A7A8C' }}>COMMUNITY NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React Devs IGDTUW"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl font-body text-xs focus:outline-none"
                  style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs block mb-1" style={{ color: '#7A7A8C' }}>CATEGORY</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Community['category'])}
                    className="w-full px-3 py-2 rounded-xl font-body text-xs focus:outline-none"
                    style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-xs block mb-1" style={{ color: '#7A7A8C' }}>AVATAR EMOJI</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl font-body text-xs focus:outline-none"
                    style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs block mb-1" style={{ color: '#7A7A8C' }}>DESCRIPTION</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your community mission and target student builders..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl font-body text-xs focus:outline-none"
                  style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                />
              </div>

              <div>
                <label className="font-mono text-xs block mb-1" style={{ color: '#7A7A8C' }}>TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  placeholder="React, Next.js, Frontend"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl font-body text-xs focus:outline-none"
                  style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-body text-xs"
                  style={{ background: '#1C1C20', color: '#7A7A8C' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl font-display font-medium text-xs transition-all"
                  style={{ background: '#C8F135', color: '#0D0D0F' }}
                >
                  {creating ? 'Launching...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
