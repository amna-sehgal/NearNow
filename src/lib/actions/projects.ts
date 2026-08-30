'use server';

import { createClient } from '@/lib/supabase/server';
import { PROJECTS, ProjectFull } from '@/lib/mock';
import { revalidatePath } from 'next/cache';

export async function fetchProjects(options?: {
  search?: string;
  category?: string;
  stack?: string;
  role?: string;
}): Promise<ProjectFull[]> {
  try {
    const supabase = await createClient();

    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (options?.category && options.category !== 'All') {
      query = query.ilike('category', `%${options.category}%`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback to static mock projects if DB query returns empty or errors
      return PROJECTS.filter(p => {
        const matchSearch = !options?.search ||
          p.name.toLowerCase().includes(options.search.toLowerCase()) ||
          p.tagline.toLowerCase().includes(options.search.toLowerCase()) ||
          p.description.toLowerCase().includes(options.search.toLowerCase());
        const matchCat = !options?.category || options.category === 'All' || p.category.includes(options.category);
        const matchStack = !options?.stack || p.stack.includes(options.stack);
        const matchRole = !options?.role || p.openRoles.some(r => r.role === options.role && !r.filled);
        return matchSearch && matchCat && matchStack && matchRole;
      });
    }

    const mappedProjects: ProjectFull[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      stack: row.stack || [],
      category: row.category,
      status: row.status || 'building',
      openRoles: row.open_roles || [],
      members: row.members || [],
      college: row.college || 'College',
      githubUrl: row.github_url || undefined,
      liveUrl: row.live_url || undefined,
      tasks: row.tasks || [],
      timestamp: 'Recently added',
      owner: row.owner_id,
      xpReward: row.xp_reward || 150,
      applicants: row.applicants || 0,
    }));

    if (options?.search) {
      const s = options.search.toLowerCase();
      return mappedProjects.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.tagline.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
      );
    }

    return mappedProjects;
  } catch {
    return PROJECTS;
  }
}

export async function fetchProjectById(id: string): Promise<ProjectFull | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return PROJECTS.find(p => p.id === id) || null;
    }

    return {
      id: data.id,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      stack: data.stack || [],
      category: data.category,
      status: data.status || 'building',
      openRoles: data.open_roles || [],
      members: data.members || [],
      college: data.college || 'College',
      githubUrl: data.github_url || undefined,
      liveUrl: data.live_url || undefined,
      tasks: data.tasks || [],
      timestamp: 'Recently added',
      owner: data.owner_id,
      xpReward: data.xp_reward || 150,
      applicants: data.applicants || 0,
    };
  } catch {
    return PROJECTS.find(p => p.id === id) || null;
  }
}

export async function createProjectAction(payload: {
  name: string;
  tagline: string;
  category: string;
  stack: string[];
  roles: { role: string; skills: string[] }[];
  description: string;
  githubUrl?: string;
  liveUrl?: string;
}): Promise<{ success?: boolean; error?: string; projectId?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'You must be signed in to launch a project.' };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const ownerName = profile?.name || user.user_metadata?.name || 'Builder';
    const ownerHandle = profile?.handle || user.email?.split('@')[0] || 'builder';
    const ownerAvatar = profile?.avatar || 'SB';
    const ownerCollege = profile?.college || 'College';

    const openRolesFormatted = payload.roles.map(r => ({
      role: r.role,
      skills: r.skills || payload.stack.slice(0, 3),
      filled: false,
    }));

    const membersFormatted = [
      {
        handle: ownerHandle,
        name: ownerName,
        avatar: ownerAvatar,
        role: 'Founder / Owner',
      },
    ];

    const initialTasks = [
      { label: 'Project specification & scope', done: true },
      { label: 'Core architecture design', done: false },
      { label: 'Initial prototype build', done: false },
      { label: 'Team recruitment & setup', done: false },
    ];

    const { data, error } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        name: payload.name.trim(),
        tagline: payload.tagline.trim(),
        description: payload.description.trim(),
        category: payload.category,
        status: 'building',
        stack: payload.stack,
        open_roles: openRolesFormatted,
        members: membersFormatted,
        tasks: initialTasks,
        college: ownerCollege,
        github_url: payload.githubUrl?.trim() || null,
        live_url: payload.liveUrl?.trim() || null,
        xp_reward: 200,
        applicants: 0,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[createProjectAction Error]:', error);
      return { error: error.message };
    }

    // Post to activity feed automatically
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'started_project',
      content: `started a new project: ${payload.name}`,
      meta: payload.tagline,
      tags: payload.stack.slice(0, 4),
    });

    revalidatePath('/projects');
    revalidatePath('/feed');
    return { success: true, projectId: data.id };
  } catch (err: any) {
    return { error: err.message || 'Failed to launch project.' };
  }
}

export async function applyForProjectRoleAction(payload: {
  projectId: string;
  role: string;
  message: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'You must be signed in to apply for project roles.' };
    }

    // Fetch current project applicants
    const { data: project } = await supabase
      .from('projects')
      .select('applicants')
      .eq('id', payload.projectId)
      .single();

    if (project) {
      await supabase
        .from('projects')
        .update({ applicants: (project.applicants || 0) + 1 })
        .eq('id', payload.projectId);
    }

    revalidatePath(`/projects/${payload.projectId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to submit role application.' };
  }
}
