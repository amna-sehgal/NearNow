'use server';

import { createClient } from '@/lib/supabase/server';
import { Activity, ACTIVITIES, formatRelativeTime } from '@/lib/data';

export async function fetchActivities(options?: {
  filter?: string;
  search?: string;
}): Promise<Activity[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('activities')
      .select(`
        id,
        type,
        content,
        meta,
        tags,
        xp,
        created_at,
        profiles (
          id,
          name,
          handle,
          avatar,
          college
        )
      `)
      .order('created_at', { ascending: false });

    if (options?.filter && options.filter !== 'all') {
      query = query.eq('type', options.filter);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback to local mock data filtered client-side if Supabase has no data or error
      const search = options?.search?.toLowerCase();
      return ACTIVITIES.filter(a => {
        const matchesFilter = !options?.filter || options.filter === 'all' || a.type === options.filter;
        const matchesSearch = !search ||
          a.user.name.toLowerCase().includes(search) ||
          a.content.toLowerCase().includes(search) ||
          a.tags?.some(t => t.toLowerCase().includes(search));
        return matchesFilter && matchesSearch;
      });
    }

    const mappedActivities: Activity[] = data.map((row: any) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : (row.profiles || {});
      const createdAt = row.created_at;
      const isFresh = new Date().getTime() - new Date(createdAt).getTime() < 15 * 60 * 1000; // Fresh if < 15m

      return {
        id: row.id,
        type: row.type,
        user: {
          name: profile?.name || 'Anonymous Student',
          handle: profile?.handle || 'builder',
          avatar: profile?.avatar || 'SB',
          college: profile?.college || 'College',
        },
        content: row.content,
        meta: row.meta || undefined,
        tags: row.tags || [],
        xp: row.xp || undefined,
        timestamp: formatRelativeTime(createdAt),
        isFresh,
      };
    });

    if (options?.search) {
      const s = options.search.toLowerCase();
      return mappedActivities.filter(a =>
        a.user.name.toLowerCase().includes(s) ||
        a.content.toLowerCase().includes(s) ||
        a.user.college.toLowerCase().includes(s) ||
        a.tags?.some(t => t.toLowerCase().includes(s))
      );
    }

    return mappedActivities;
  } catch {
    return ACTIVITIES;
  }
}

export async function fetchActivityById(id: string): Promise<Activity | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        type,
        content,
        meta,
        tags,
        xp,
        created_at,
        profiles (
          id,
          name,
          handle,
          avatar,
          college
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      // Check fallback static ACTIVITIES array
      const staticMatch = ACTIVITIES.find(a => a.id === id);
      return staticMatch || null;
    }

    const row: any = data;
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : (row.profiles || {});

    return {
      id: row.id,
      type: row.type,
      user: {
        name: profile?.name || 'Anonymous Student',
        handle: profile?.handle || 'builder',
        avatar: profile?.avatar || 'SB',
        college: profile?.college || 'College',
      },
      content: row.content,
      meta: row.meta || undefined,
      tags: row.tags || [],
      xp: row.xp || undefined,
      timestamp: formatRelativeTime(row.created_at),
      isFresh: new Date().getTime() - new Date(row.created_at).getTime() < 15 * 60 * 1000,
    };
  } catch {
    return ACTIVITIES.find(a => a.id === id) || null;
  }
}

export async function createActivityAction(payload: {
  type: string;
  content: string;
  meta?: string;
  tags?: string[];
}): Promise<{ success?: boolean; error?: string; activityId?: string }> {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be signed in to create an activity post.' };
    }

    if (!payload.type || !payload.content.trim()) {
      return { error: 'Activity type and content are required.' };
    }

    // Ensure profile exists for user
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Create profile automatically if missing
      const emailHandle = user.email?.split('@')[0] || 'builder';
      const name = user.user_metadata?.name || 'Student Builder';
      const college = user.user_metadata?.college || 'Indian College';
      const avatar = name.slice(0, 2).toUpperCase();

      await supabase.from('profiles').insert({
        id: user.id,
        name,
        handle: emailHandle,
        avatar,
        college,
      });
    }

    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        type: payload.type,
        content: payload.content.trim(),
        meta: payload.meta?.trim() || null,
        tags: payload.tags || [],
        xp: payload.type === 'earned_xp' || payload.type === 'completed_mission' ? 100 : null,
      })
      .select('id')
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, activityId: data.id };
  } catch (err: any) {
    return { error: err.message || 'Failed to create activity post.' };
  }
}
