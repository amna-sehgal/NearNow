'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
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

    let query = supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (
          id,
          name,
          handle,
          avatar,
          college
        )
      `)
      .order('created_at', { ascending: false });

    if (options?.category && options.category !== 'All') {
      query = query.ilike('category', `%${options.category}%`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback to static mock projects if DB query errors or yields no rows
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedProjects: ProjectFull[] = data.map((row: any) => {
      const ownerProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const ownerName = ownerProfile?.name || row.members?.[0]?.name || 'Builder';
      const ownerHandle = ownerProfile?.handle || row.members?.[0]?.handle || 'builder';
      const ownerAvatar = ownerProfile?.avatar || row.members?.[0]?.avatar || 'SB';

      const members = row.members && row.members.length > 0 ? row.members : [
        { handle: ownerHandle, name: ownerName, avatar: ownerAvatar, role: 'Founder / Owner' }
      ];

      return {
        id: row.id,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        stack: row.stack || [],
        category: row.category,
        status: row.status || 'building',
        openRoles: row.open_roles || [],
        members,
        college: ownerProfile?.college || row.college || 'College',
        githubUrl: row.github_url || undefined,
        liveUrl: row.live_url || undefined,
        tasks: row.tasks || [],
        timestamp: 'Recently added',
        owner: ownerHandle,
        xpReward: row.xp_reward || 150,
        applicants: row.applicants || 0,
      };
    });

    if (options?.search) {
      const s = options.search.toLowerCase();
      return mappedProjects.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.tagline.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
      );
    }

    if (options?.stack) {
      return mappedProjects.filter(p => p.stack.includes(options.stack!));
    }

    if (options?.role) {
      return mappedProjects.filter(p => p.openRoles.some(r => r.role === options.role && !r.filled));
    }

    return mappedProjects;
  } catch (err) {
    console.error('[fetchProjects Exception]:', err);
    return PROJECTS;
  }
}

export async function fetchProjectById(id: string): Promise<ProjectFull | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (
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
      return PROJECTS.find(p => p.id === id) || null;
    }

    const ownerProfile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    const ownerName = ownerProfile?.name || data.members?.[0]?.name || 'Builder';
    const ownerHandle = ownerProfile?.handle || data.members?.[0]?.handle || 'builder';
    const ownerAvatar = ownerProfile?.avatar || data.members?.[0]?.avatar || 'SB';

    const members = data.members && data.members.length > 0 ? data.members : [
      { handle: ownerHandle, name: ownerName, avatar: ownerAvatar, role: 'Founder / Owner' }
    ];

    return {
      id: data.id,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      stack: data.stack || [],
      category: data.category,
      status: data.status || 'building',
      openRoles: data.open_roles || [],
      members,
      college: ownerProfile?.college || data.college || 'College',
      githubUrl: data.github_url || undefined,
      liveUrl: data.live_url || undefined,
      tasks: data.tasks || [],
      timestamp: 'Recently added',
      owner: ownerHandle,
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

    // 1. Strict Authentication Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'You must be signed in to launch a project.' };
    }

    // 2. Strict Input Validation
    if (!payload.name || payload.name.trim().length < 3) {
      return { error: 'Project name must be at least 3 characters long.' };
    }
    if (!payload.tagline || payload.tagline.trim().length < 6) {
      return { error: 'Project tagline must be at least 6 characters long.' };
    }
    if (!payload.category) {
      return { error: 'Please select a project category.' };
    }
    if (!payload.stack || payload.stack.length === 0) {
      return { error: 'Please add at least one technology stack tag.' };
    }
    if (!payload.description || payload.description.trim().length < 20) {
      return { error: 'Project description must be at least 20 characters long.' };
    }

    // 3. Get Owner Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const ownerCollege = profile?.college || 'College';

    const openRolesFormatted = payload.roles.map(r => ({
      role: r.role,
      skills: r.skills && r.skills.length > 0 ? r.skills : payload.stack.slice(0, 3),
      filled: false,
    }));

    const initialTasks = [
      { label: 'Project specification & scope', done: true },
      { label: 'Core architecture design', done: false },
      { label: 'Initial prototype build', done: false },
      { label: 'Team recruitment & setup', done: false },
    ];

    // 4. Call Atomic Domain RPC via Admin Client (handles project creation, race-safe advisory locked XP cap, and xp_logs atomically)
    const adminSupabase = await createAdminClient();
    const { data: rpcRes, error: rpcErr } = await adminSupabase.rpc('create_project_with_xp', {
      user_id_input: user.id,
      name_input: payload.name.trim(),
      tagline_input: payload.tagline.trim(),
      description_input: payload.description.trim(),
      category_input: payload.category,
      stack_input: payload.stack,
      open_roles_input: openRolesFormatted,
      tasks_input: initialTasks,
      college_input: ownerCollege,
      github_url_input: payload.githubUrl?.trim() || null,
      live_url_input: payload.liveUrl?.trim() || null,
    });

    if (rpcErr) {
      console.error('[createProjectAction RPC Error]:', rpcErr);
      return { error: rpcErr.message };
    }

    const newProjectId = rpcRes?.project_id;

    // 5. Broadcast to Feed
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'started_project',
      content: `started a new project: ${payload.name.trim()}`,
      meta: payload.tagline.trim(),
      tags: payload.stack.slice(0, 4),
      xp: rpcRes?.xp_awarded ?? 150,
    });

    revalidatePath('/projects');
    revalidatePath('/feed');
    return { success: true, projectId: newProjectId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to launch project.';
    return { error: errorMsg };
  }
}

export async function applyForProjectRoleAction(payload: {
  projectId: string;
  role: string;
  message: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Strict Session Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'You must be signed in to apply for project roles.' };
    }

    // 2. Input Validation
    if (!payload.projectId) {
      return { error: 'Invalid project ID.' };
    }
    if (!payload.role) {
      return { error: 'Role specification required.' };
    }
    if (!payload.message || !payload.message.trim()) {
      return { error: 'Please include a message with your application.' };
    }

    // 3. Prevent Duplicate Applications
    const { data: existingApp } = await supabase
      .from('project_applications')
      .select('id')
      .eq('project_id', payload.projectId)
      .eq('applicant_id', user.id)
      .eq('role', payload.role)
      .maybeSingle();

    if (existingApp) {
      return { error: 'You have already applied for this role on this project.' };
    }

    // 4. Save Application to Supabase (applicant_id comes strictly from auth user session)
    const { error: appError } = await supabase
      .from('project_applications')
      .insert({
        project_id: payload.projectId,
        applicant_id: user.id,
        role: payload.role,
        message: payload.message.trim(),
        status: 'pending',
      });

    if (appError) {
      console.error('[applyForProjectRoleAction DB Error]:', appError);
      return { error: appError.message };
    }

    // 5. Update Applicants Count on Project
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
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Failed to submit role application.' };
  }
}
