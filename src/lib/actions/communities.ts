'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserProfile } from '@/lib/mock';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'Web Dev' | 'AI / ML' | 'Open Source' | 'DevOps' | 'Design' | 'Web3' | 'General';
  avatar: string;
  banner?: string;
  creatorId?: string;
  membersCount: number;
  postsCount: number;
  tags: string[];
  isJoined?: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    college: string;
  };
  title?: string;
  content: string;
  likesCount: number;
  createdAt: string;
}



export async function fetchCommunities(category?: string, search?: string): Promise<Community[]> {
  try {
    const supabase = await createClient();

    let query = supabase.from('communities').select('*').order('created_at', { ascending: false }).limit(50);
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const [{ data: rows, error }, { data: { user } }] = await Promise.all([
      query,
      supabase.auth.getUser(),
    ]);

    let joinedIds: string[] = [];
    if (user) {
      const { data: userMemb } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id);

      if (userMemb) {
        joinedIds = userMemb.map(m => m.community_id);
      }
    }

    if (!error && rows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Community[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        category: r.category,
        avatar: r.avatar || '🌐',
        banner: r.banner || undefined,
        creatorId: r.creator_id || undefined,
        membersCount: r.members_count || 1,
        postsCount: r.posts_count || 0,
        tags: r.tags || [],
        isJoined: joinedIds.includes(r.id),
        createdAt: r.created_at,
      }));

      if (search) {
        const s = search.toLowerCase();
        return mapped.filter(c =>
          c.name.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s) ||
          c.tags.some(t => t.toLowerCase().includes(s))
        );
      }
      return mapped;
    }
  } catch (e) {
    console.error('[fetchCommunities error]:', e);
  }

  // Safe empty fallback for DB error or connection failure
  return [];
}

export async function fetchCommunityById(idOrSlug: string): Promise<Community | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: r, error } = await supabase
      .from('communities')
      .select('*')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .single();

    let isJoined = false;
    if (user && r) {
      const { data: m } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', r.id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (m) isJoined = true;
    }

    if (!error) {
      if (!r) return null;
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        category: r.category,
        avatar: r.avatar || '🌐',
        banner: r.banner || undefined,
        creatorId: r.creator_id || undefined,
        membersCount: r.members_count || 1,
        postsCount: r.posts_count || 0,
        tags: r.tags || [],
        isJoined,
        createdAt: r.created_at,
      };
    }
  } catch (e) {
    console.error('[fetchCommunityById error]:', e);
  }

  return null;
}

export async function fetchCommunityMembers(communityId: string): Promise<UserProfile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        role,
        joined_at,
        profiles (*)
      `)
      .eq('community_id', communityId);

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((r: any) => {
        const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
        return {
          handle: p?.handle || 'builder',
          name: p?.name || 'Student Builder',
          avatar: p?.avatar || (p?.name ? p.name.slice(0, 2).toUpperCase() : 'SB'),
          college: p?.college || 'College',
          year: p?.year || 'Student',
          location: p?.location || 'India',
          bio: p?.bio || '',
          reputation: p?.reputation ?? 100,
          xp: p?.xp ?? 0,
          xpToNext: p?.xp_to_next ?? 1000,
          skills: p?.skills || [],
          lookingFor: p?.looking_for || [],
          links: {
            github: p?.github || undefined,
            linkedin: p?.linkedin || undefined,
            portfolio: p?.portfolio || undefined,
          },
          stats: { projects: 0, missions: 0, hackathons: 0, contributions: 0 },
          badges: [{ label: r.role === 'admin' ? 'Community Admin' : 'Community Member', icon: '👥' }],
          recentActivity: [],
          currentProjects: [],
        };
      });
    }
  } catch (e) {
    console.error('[fetchCommunityMembers error]:', e);
  }

  // Return empty roster if no members found or DB query failed
  return [];
}

export async function joinCommunityAction(communityId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be signed in to join a community.' };
    }

    // Atomic Domain RPC via Admin Client (handles community_members, members_count trigger, xp, and xp_logs atomically)
    const adminSupabase = await createAdminClient();
    const { data: rpcRes, error: rpcErr } = await adminSupabase.rpc('join_community_with_xp', {
      user_id_input: user.id,
      comm_id_input: communityId,
    });

    if (rpcErr) {
      console.error('[joinCommunityAction RPC Error]:', rpcErr);
      return { error: rpcErr.message };
    }

    if (rpcRes && !rpcRes.success && rpcRes.already_joined) {
      return { error: rpcRes.message || 'You are already a member of this community.' };
    }

    const { data: comm } = await supabase
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single();

    const commName = comm?.name || 'Developer Community';

    // Log activity
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'earned_xp',
      content: `joined community: ${commName}`,
      xp: 20,
    });

    revalidatePath('/communities');
    revalidatePath(`/communities/${communityId}`);
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to join community.' };
  }
}

export async function leaveCommunityAction(communityId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be signed in to leave a community.' };
    }

    await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    revalidatePath('/communities');
    revalidatePath(`/communities/${communityId}`);
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to leave community.' };
  }
}

export async function fetchCommunityPosts(communityId: string): Promise<CommunityPost[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles:author_id ( name, handle, avatar, college )
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((r: any) => {
        const author = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
        return {
          id: r.id,
          communityId: r.community_id,
          author: {
            name: author?.name || 'Student Builder',
            handle: author?.handle || 'builder',
            avatar: author?.avatar || 'SB',
            college: author?.college || 'College',
          },
          title: r.title || undefined,
          content: r.content,
          likesCount: r.likes_count || 0,
          createdAt: new Date(r.created_at).toLocaleDateString(),
        };
      });
    }
  } catch (e) {
    console.error('[fetchCommunityPosts error]:', e);
  }

  // Return empty list if no posts exist or DB query failed
  return [];
}

export async function createCommunityPostAction(payload: {
  communityId: string;
  title?: string;
  content: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be signed in to post in a community.' };
    }

    if (!payload.content || !payload.content.trim()) {
      return { error: 'Post content cannot be empty.' };
    }

    const { error } = await supabase
      .from('community_posts')
      .insert({
        community_id: payload.communityId,
        author_id: user.id,
        title: payload.title?.trim() || null,
        content: payload.content.trim(),
      });

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/communities/${payload.communityId}`);
    return { success: true };
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to create post.' };
  }
}

export async function createCommunityAction(payload: {
  name: string;
  description: string;
  category: Community['category'];
  avatar?: string;
  tags: string[];
}): Promise<{ success?: boolean; error?: string; communityId?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be signed in to create a community.' };
    }

    if (!payload.name || payload.name.trim().length < 3) {
      return { error: 'Community name must be at least 3 characters long.' };
    }
    if (!payload.description || payload.description.trim().length < 10) {
      return { error: 'Community description must be at least 10 characters long.' };
    }

    const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { data, error } = await supabase
      .from('communities')
      .insert({
        name: payload.name.trim(),
        slug,
        description: payload.description.trim(),
        category: payload.category,
        avatar: payload.avatar || '🌐',
        creator_id: user.id,
        members_count: 0,
        posts_count: 0,
        tags: payload.tags,
      })
      .select('id')
      .single();

    if (error) {
      return { error: error.message };
    }

    // Add creator as admin member using admin client (bypasses direct client INSERT restriction)
    const adminSupabase = await createAdminClient();
    await adminSupabase.from('community_members').insert({
      community_id: data.id,
      user_id: user.id,
      role: 'admin',
    });

    revalidatePath('/communities');
    return { success: true, communityId: data.id };
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to create community.' };
  }
}
