'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'Frontend' | 'Backend' | 'AI / ML' | 'DevOps' | 'Open Source';
  xp: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  skills: string[];
  deliverables: string[];
  completedByCount?: number;
  isCompletedByCurrentUser?: boolean;
}

export const MISSIONS: Mission[] = [
  {
    id: 'm-001',
    title: 'Build a REST API with Auth',
    description: 'Implement JWT authentication and password hashing in Node.js/Express or FastAPI with protected endpoints and rate limiting.',
    category: 'Backend',
    xp: 120,
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    skills: ['Node.js', 'JWT', 'Express', 'Security'],
    deliverables: ['GitHub Repository link', 'Live API endpoint test via Postman/curl'],
    completedByCount: 42,
  },
  {
    id: 'm-002',
    title: 'Deploy Fullstack App with Docker',
    description: 'Containerize a React frontend and Node.js backend using Dockerfile and docker-compose.yml. Deploy to server or cloud provider.',
    category: 'DevOps',
    xp: 150,
    difficulty: 'Intermediate',
    estimatedTime: '3 hours',
    skills: ['Docker', 'DevOps', 'CI/CD', 'Linux'],
    deliverables: ['docker-compose.yml configuration', 'Live deployed URL'],
    completedByCount: 28,
  },
  {
    id: 'm-003',
    title: 'Integrate Gemini LLM for AI Features',
    description: 'Build an interactive AI prompt generator or smart resume reviewer using Google Gemini API with streaming responses.',
    category: 'AI / ML',
    xp: 180,
    difficulty: 'Advanced',
    estimatedTime: '3-4 hours',
    skills: ['Gemini API', 'Python', 'Next.js', 'LLMs'],
    deliverables: ['Working demo link', 'Public GitHub repo'],
    completedByCount: 35,
  },
  {
    id: 'm-004',
    title: 'Design & Build Responsive Dark Dashboard',
    description: 'Build a glassmorphism dark-mode analytics dashboard in Next.js & Tailwind featuring responsive charts and micro-animations.',
    category: 'Frontend',
    xp: 100,
    difficulty: 'Beginner',
    estimatedTime: '2 hours',
    skills: ['React', 'Next.js', 'TailwindCSS', 'UI/UX'],
    deliverables: ['Vercel deployment link', 'Figma or GitHub repo'],
    completedByCount: 56,
  },
  {
    id: 'm-005',
    title: 'Fix an Open Source Issue & Merge PR',
    description: 'Find a good first issue on a popular open source repository, submit a PR, and get it merged by maintainers.',
    category: 'Open Source',
    xp: 200,
    difficulty: 'Advanced',
    estimatedTime: '4-5 hours',
    skills: ['Git', 'Open Source', 'Code Review', 'Testing'],
    deliverables: ['Merged Pull Request URL'],
    completedByCount: 19,
  },
];

export async function fetchMissions(category?: string): Promise<Mission[]> {
  try {
    const supabase = await createClient();

    let query = supabase.from('missions').select('*');
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data: rows } = await query;
    const { data: { user } } = await supabase.auth.getUser();

    let completedIds: string[] = [];
    if (user) {
      const { data: userMissions } = await supabase
        .from('user_missions')
        .select('mission_id')
        .eq('user_id', user.id);

      if (userMissions) {
        completedIds = userMissions.map(m => m.mission_id);
      }
    }

    if (!rows || rows.length === 0) {
      return MISSIONS.filter(m => !category || category === 'All' || m.category === category).map(m => ({
        ...m,
        isCompletedByCurrentUser: completedIds.includes(m.id),
      }));
    }

    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      xp: r.xp || 100,
      difficulty: r.difficulty || 'Intermediate',
      estimatedTime: r.estimated_time || '2 hours',
      skills: r.skills || [],
      deliverables: r.deliverables || [],
      completedByCount: 10,
      isCompletedByCurrentUser: completedIds.includes(r.id),
    }));
  } catch {
    return MISSIONS;
  }
}

export async function fetchMissionById(id: string): Promise<Mission | null> {
  try {
    const supabase = await createClient();
    const { data: row } = await supabase.from('missions').select('*').eq('id', id).single();

    const { data: { user } } = await supabase.auth.getUser();
    let isCompleted = false;
    if (user) {
      const { data: um } = await supabase
        .from('user_missions')
        .select('id')
        .eq('user_id', user.id)
        .eq('mission_id', id)
        .single();
      if (um) isCompleted = true;
    }

    if (!row) {
      const staticMission = MISSIONS.find(m => m.id === id);
      if (staticMission) {
        return { ...staticMission, isCompletedByCurrentUser: isCompleted };
      }
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      xp: row.xp || 100,
      difficulty: row.difficulty || 'Intermediate',
      estimatedTime: row.estimated_time || '2 hours',
      skills: row.skills || [],
      deliverables: row.deliverables || [],
      isCompletedByCurrentUser: isCompleted,
    };
  } catch {
    return MISSIONS.find(m => m.id === id) || null;
  }
}

export async function completeMissionAction(payload: {
  missionId: string;
  submissionUrl?: string;
}): Promise<{ success?: boolean; error?: string; xpEarned?: number }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'You must be signed in to complete a mission.' };
    }

    const mission = await fetchMissionById(payload.missionId);
    if (!mission) {
      return { error: 'Mission not found.' };
    }

    // Record user mission completion in DB
    await supabase.from('user_missions').upsert({
      user_id: user.id,
      mission_id: payload.missionId,
      status: 'completed',
      submission_url: payload.submissionUrl?.trim() || null,
      completed_at: new Date().toISOString(),
    });

    // Update user profile XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', user.id)
      .single();

    const currentXp = profile?.xp || 0;
    const newXp = currentXp + mission.xp;

    await supabase
      .from('profiles')
      .update({ xp: newXp })
      .eq('id', user.id);

    // Create activity post in feed
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'earned_xp',
      content: `completed Skill Mission: ${mission.title}`,
      meta: payload.submissionUrl ? `Submission: ${payload.submissionUrl}` : `Earned +${mission.xp} XP`,
      tags: mission.skills.slice(0, 4),
      xp: mission.xp,
    });

    revalidatePath('/missions');
    revalidatePath('/profile');
    revalidatePath('/feed');

    return { success: true, xpEarned: mission.xp };
  } catch (err: any) {
    return { error: err.message || 'Failed to submit mission completion.' };
  }
}
