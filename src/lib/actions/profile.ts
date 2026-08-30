'use server';

import { createClient } from '@/lib/supabase/server';
import { PROFILES, UserProfile } from '@/lib/mock';
import { revalidatePath } from 'next/cache';

export async function fetchProfileByHandle(handle: string): Promise<{ profile: UserProfile | null; isFromDb: boolean }> {
  try {
    const supabase = await createClient();

    const { data: row, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', handle)
      .single();

    if (error || !row) {
      // Fallback to static mock profiles if database record doesn't exist
      const mockProfile = PROFILES[handle] || null;
      return { profile: mockProfile, isFromDb: false };
    }

    // Map DB profile row to UserProfile structure
    const profile: UserProfile = {
      handle: row.handle,
      name: row.name,
      avatar: row.avatar || row.name.slice(0, 2).toUpperCase(),
      college: row.college || 'College Builder',
      year: row.year || 'B.Tech Student',
      location: row.location || 'India',
      bio: row.bio || 'Building innovative projects on NearNow.',
      reputation: row.reputation ?? 100,
      xp: row.xp ?? 0,
      xpToNext: row.xp_to_next ?? 1000,
      skills: row.skills || [],
      lookingFor: row.looking_for || [],
      links: {
        github: row.github || undefined,
        linkedin: row.linkedin || undefined,
        portfolio: row.portfolio || undefined,
      },
      stats: {
        projects: 0,
        missions: 0,
        hackathons: 0,
        contributions: 0,
      },
      badges: [
        { label: 'Verified Builder', icon: '⚡' },
        { label: 'NearNow Member', icon: '🚀' },
      ],
      recentActivity: [],
      currentProjects: [],
    };

    // Calculate stats & fetch activities/projects count
    const { count: activitiesCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', row.id);

    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', row.id);

    profile.stats.contributions = activitiesCount || 0;
    profile.stats.projects = projectsCount || 0;

    return { profile, isFromDb: true };
  } catch (err) {
    console.error('[fetchProfileByHandle Exception]:', err);
    return { profile: PROFILES[handle] || null, isFromDb: false };
  }
}

export async function fetchProfileById(id: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();

    const { data: row, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !row) return null;

    return {
      handle: row.handle,
      name: row.name,
      avatar: row.avatar || row.name.slice(0, 2).toUpperCase(),
      college: row.college || 'College Builder',
      year: row.year || 'Student',
      location: row.location || 'India',
      bio: row.bio || '',
      reputation: row.reputation ?? 100,
      xp: row.xp ?? 0,
      xpToNext: row.xp_to_next ?? 1000,
      skills: row.skills || [],
      lookingFor: row.looking_for || [],
      links: {
        github: row.github || undefined,
        linkedin: row.linkedin || undefined,
        portfolio: row.portfolio || undefined,
      },
      stats: { projects: 0, missions: 0, hackathons: 0, contributions: 0 },
      badges: [{ label: 'Verified Builder', icon: '⚡' }],
      recentActivity: [],
      currentProjects: [],
    };
  } catch {
    return null;
  }
}

export async function updateProfile(payload: {
  name: string;
  bio: string;
  college: string;
  year: string;
  location: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  skills: string[];
  lookingFor: string[];
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'You must be signed in to update your profile.' };
    }

    // Fetch existing profile to preserve handle, avatar, etc.
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('handle, avatar')
      .eq('id', user.id)
      .single();

    const fallbackHandle = (user.email?.split('@')[0] || payload.name).toLowerCase().replace(/[^a-z0-9_]/g, '') || 'builder';
    const handle = existingProfile?.handle || fallbackHandle;

    const computedAvatar = payload.name.trim().split(' ').length >= 2
      ? (payload.name.trim().split(' ')[0][0] + payload.name.trim().split(' ')[1][0]).toUpperCase()
      : payload.name.slice(0, 2).toUpperCase();
    const avatar = existingProfile?.avatar || computedAvatar;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        handle,
        name: payload.name.trim(),
        avatar,
        bio: payload.bio.trim(),
        college: payload.college.trim(),
        year: payload.year.trim(),
        location: payload.location.trim(),
        github: payload.github?.trim() || null,
        linkedin: payload.linkedin?.trim() || null,
        portfolio: payload.portfolio?.trim() || null,
        skills: payload.skills,
        looking_for: payload.lookingFor,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[updateProfile Error]:', error);
      return { error: error.message };
    }

    revalidatePath('/profile');
    revalidatePath('/feed');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update profile.' };
  }
}
