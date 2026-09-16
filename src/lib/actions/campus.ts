'use server';

import { createClient } from '@/lib/supabase/server';
import { UserProfile, ProjectFull } from '@/lib/mock';

export interface CampusStats {
  college: string;
  activeBuilders: number;
  liveProjects: number;
  hackathonTeams: number;
  totalReputation: number;
  totalXp: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  college: string;
  date: string;
  type: string;
  location: string;
  organizer: string;
  attendeesCount: number;
  link?: string;
}

const MOCK_CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'evt-1',
    title: '[Sample] HackIGDTUW 2026 AI Sprint',
    college: 'IGDTUW',
    date: 'Oct 12, 2026',
    type: 'Hackathon',
    location: 'Auditorium, IGDTUW',
    organizer: 'IGDTUW ACM-W',
    attendeesCount: 140,
    link: 'https://hackigdtuw.dev',
  },
  {
    id: 'evt-2',
    title: '[Sample] NSUT Open Source & Web3 Summit',
    college: 'NSUT',
    date: 'Oct 18, 2026',
    type: 'Summit & Workshops',
    location: 'Main Block, NSUT',
    organizer: 'DevClub NSUT',
    attendeesCount: 210,
    link: 'https://nsutdevs.in',
  },
  {
    id: 'evt-3',
    title: '[Sample] DTU Innovate TechExpo & Pitch',
    college: 'DTU',
    date: 'Nov 02, 2026',
    type: 'Exhibition',
    location: 'DTU Campus',
    organizer: 'E-Cell DTU',
    attendeesCount: 320,
    link: 'https://dtuinnovate.in',
  },
  {
    id: 'evt-4',
    title: '[Sample] IIIT Delhi AI & Robotics Hackday',
    college: 'IIIT Delhi',
    date: 'Nov 10, 2026',
    type: 'Hackathon',
    location: 'R&D Block, IIIT Delhi',
    organizer: 'Byld IIITD',
    attendeesCount: 185,
    link: 'https://byld.iiitd.ac.in',
  },
];

export async function fetchCampusStats(college: string = 'All Campuses'): Promise<CampusStats> {
  try {
    const supabase = await createClient();

    let query = supabase.from('profiles').select('reputation, xp, college');
    if (college !== 'All Campuses') {
      query = query.ilike('college', `%${college}%`);
    }

    const { data: profiles, error: pErr } = await query;

    let projQuery = supabase.from('projects').select('id, college');
    if (college !== 'All Campuses') {
      projQuery = projQuery.ilike('college', `%${college}%`);
    }

    const { data: projects } = await projQuery;

    if (!pErr && profiles) {
      const activeBuilders = profiles.length;
      const liveProjects = projects ? projects.length : 0;
      const totalReputation = profiles.reduce((sum, p) => sum + (p.reputation || 0), 0);
      const totalXp = profiles.reduce((sum, p) => sum + (p.xp || 0), 0);
      const hackathonTeams = Math.max(0, Math.floor(liveProjects * 0.4));

      return {
        college,
        activeBuilders,
        liveProjects,
        hackathonTeams,
        totalReputation,
        totalXp,
      };
    }
  } catch (e) {
    console.error('[fetchCampusStats error]:', e);
  }

  // Safe empty fallback for DB error or connection failure
  return {
    college,
    activeBuilders: 0,
    liveProjects: 0,
    hackathonTeams: 0,
    totalReputation: 0,
    totalXp: 0,
  };
}

export async function fetchCampusBuilders(college: string = 'All Campuses'): Promise<UserProfile[]> {
  try {
    const supabase = await createClient();

    let query = supabase.from('profiles').select('*').order('reputation', { ascending: false });
    if (college !== 'All Campuses') {
      query = query.ilike('college', `%${college}%`);
    }

    const { data: rows, error } = await query;

    if (!error && rows) {
      return rows.map((row: Record<string, unknown>) => ({
        handle: String(row.handle || 'builder'),
        name: String(row.name || 'Student Builder'),
        avatar: String(row.avatar || (row.name ? String(row.name).slice(0, 2).toUpperCase() : 'SB')),
        college: String(row.college || 'College Builder'),
        year: String(row.year || 'Student'),
        location: String(row.location || 'India'),
        bio: String(row.bio || ''),
        reputation: Number(row.reputation ?? 100),
        xp: Number(row.xp ?? 0),
        xpToNext: Number(row.xp_to_next ?? 1000),
        skills: (row.skills as string[]) || [],
        lookingFor: (row.looking_for as string[]) || [],
        links: {
          github: row.github ? String(row.github) : undefined,
          linkedin: row.linkedin ? String(row.linkedin) : undefined,
          portfolio: row.portfolio ? String(row.portfolio) : undefined,
        },
        stats: { projects: 0, missions: 0, hackathons: 0, contributions: 0 },
        badges: [
          { label: 'Verified Builder', icon: '⚡' },
          { label: Number(row.reputation ?? 0) >= 500 ? 'Top Builder' : 'Campus Member', icon: Number(row.reputation ?? 0) >= 500 ? '🔥' : '🎓' },
        ],
        recentActivity: [],
        currentProjects: [],
      }));
    }
  } catch (e) {
    console.error('[fetchCampusBuilders error]:', e);
  }

  // DB connection error or non-migrated DB: return empty array rather than fake builders masquerading as real users
  return [];
}

export async function fetchCampusProjects(college: string = 'All Campuses'): Promise<ProjectFull[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id ( id, name, handle, avatar, college )
      `)
      .order('created_at', { ascending: false });

    if (college !== 'All Campuses') {
      query = query.ilike('college', `%${college}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((row: any) => {
        const ownerProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          id: row.id,
          name: row.name,
          tagline: row.tagline,
          description: row.description,
          stack: row.stack || [],
          category: row.category,
          status: row.status || 'building',
          openRoles: row.open_roles || [],
          members: row.members || [],
          college: ownerProfile?.college || row.college || 'College',
          githubUrl: row.github_url || undefined,
          liveUrl: row.live_url || undefined,
          tasks: row.tasks || [],
          timestamp: 'Recently added',
          owner: ownerProfile?.handle || 'builder',
          xpReward: row.xp_reward || 150,
          applicants: row.applicants || 0,
        };
      });
    }
  } catch (e) {
    console.error('[fetchCampusProjects error]:', e);
  }

  // DB connection error or non-migrated DB: return empty array rather than fake projects masquerading as real projects
  return [];
}

export async function fetchCampusEvents(college: string = 'All Campuses'): Promise<CampusEvent[]> {
  if (college === 'All Campuses') return MOCK_CAMPUS_EVENTS;
  return MOCK_CAMPUS_EVENTS.filter(e => e.college.toLowerCase().includes(college.toLowerCase()));
}
