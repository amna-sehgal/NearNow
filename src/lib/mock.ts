// src/lib/mock.ts
import { Activity, ACTIVITIES } from './data';
import { CANONICAL_COLLEGES, ALL_CAMPUSES_LABEL } from './constants';

export const COLLEGES = [
  ALL_CAMPUSES_LABEL,
  ...CANONICAL_COLLEGES,
];

export interface UserProfile {
  handle: string;
  name: string;
  avatar: string;
  college: string;
  year: string;
  location: string;
  bio: string;
  reputation: number;
  xp: number;
  xpToNext: number;
  skills: string[];
  lookingFor: string[];
  links: { github?: string; linkedin?: string; portfolio?: string; };
  stats: { projects: number; missions: number; hackathons: number; contributions: number; };
  badges: { label: string; icon: string; }[];
  recentActivity: Activity[];
  currentProjects: string[];
}

export interface ProjectFull {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  category: string;
  status: 'active' | 'building' | 'completed' | 'paused';
  openRoles: { role: string; skills: string[]; filled: boolean; }[];
  members: { handle: string; name: string; avatar: string; role: string; }[];
  college: string;
  githubUrl?: string;
  liveUrl?: string;
  tasks: { label: string; done: boolean; }[];
  timestamp: string;
  owner: string;
  xpReward: number;
  applicants: number;
}

export const PROFILES: Record<string, UserProfile> = {
  amna_s: {
    handle: 'amna_s',
    name: 'Amna Sehgal',
    avatar: 'AS',
    college: 'IGDTUW',
    year: '2nd Year B.Tech CSE (AI)',
    location: 'Delhi',
    bio: 'Building things that matter. Frontend engineer obsessed with clean UI and fast products. Co-building Near Now.',
    reputation: 842,
    xp: 1240,
    xpToNext: 1500,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Figma', 'Node.js'],
    lookingFor: ['Backend Developer', 'ML Engineer'],
    links: { github: 'github.com/amna-s', linkedin: 'linkedin.com/in/amna-s', portfolio: 'amna.dev' },
    stats: { projects: 4, missions: 12, hackathons: 3, contributions: 28 },
    badges: [
      { label: 'Early Builder', icon: '🚀' },
      { label: 'Hackathon Finalist', icon: '🏆' },
      { label: 'OSS Contributor', icon: '🌿' },
      { label: 'Mission Streak x7', icon: '⚡' },
    ],
    recentActivity: ACTIVITIES.filter(a => a.user.handle === 'amna_s'),
    currentProjects: 'nn-001',
  } as unknown as UserProfile,
  harsh_r: {
    handle: 'harsh_r',
    name: 'Harsh Raj',
    avatar: 'HR',
    college: 'NSUT',
    year: '3rd Year B.Tech CSE',
    location: 'Delhi',
    bio: 'Product thinker. Building Near Now. Prev: 2x hackathon winner. I care about what students actually need.',
    reputation: 920,
    xp: 1780,
    xpToNext: 2000,
    skills: ['Product', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    lookingFor: ['UI/UX Designer', 'ML Engineer'],
    links: { github: 'github.com/harsh-r', linkedin: 'linkedin.com/in/harsh-r' },
    stats: { projects: 6, missions: 18, hackathons: 5, contributions: 42 },
    badges: [
      { label: 'Top Builder', icon: '🔥' },
      { label: 'Hackathon Winner', icon: '🏆' },
      { label: 'Team Leader', icon: '👥' },
      { label: '500 XP Week', icon: '⚡' },
    ],
    recentActivity: ACTIVITIES.filter(a => a.user.handle === 'harsh_r'),
    currentProjects: 'nn-001',
  } as unknown as UserProfile,
  priya_sh: {
    handle: 'priya_sh',
    name: 'Priya Sharma',
    avatar: 'PS',
    college: 'DTU',
    year: '3rd Year B.Tech IT',
    location: 'Delhi',
    bio: 'Full-stack dev. Love building products with real users. Won HackDelhi 2026 with EcoTrack.',
    reputation: 760,
    xp: 980,
    xpToNext: 1000,
    skills: ['React', 'Python', 'FastAPI', 'MongoDB', 'TensorFlow'],
    lookingFor: ['Frontend Developer', 'DevOps Engineer'],
    links: { github: 'github.com/priya-sh', linkedin: 'linkedin.com/in/priya-sh' },
    stats: { projects: 3, missions: 9, hackathons: 4, contributions: 15 },
    badges: [
      { label: 'HackDelhi Winner', icon: '🏆' },
      { label: 'AI Builder', icon: '🤖' },
    ],
    recentActivity: ACTIVITIES.filter(a => a.user.handle === 'priya_sh'),
    currentProjects: 'p-003',
  } as unknown as UserProfile,
};

export const PROJECTS: ProjectFull[] = [
  {
    id: 'nn-001',
    name: 'Near Now',
    tagline: 'The collaboration layer for Indian college students',
    description: 'A real-time activity and collaboration platform where students discover what others are building, find teammates, and earn reputation through actual contribution. Built to replace the scattered WhatsApp groups and LinkedIn cold DMs that students use to find co-founders.',
    stack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Tailwind'],
    category: 'EdTech / Community',
    status: 'building',
    openRoles: [
      { role: 'Backend Developer', skills: ['Node.js', 'PostgreSQL', 'Redis'], filled: false },
      { role: 'ML Engineer', skills: ['Python', 'Recommendation Systems'], filled: false },
      { role: 'UI/UX Designer', skills: ['Figma', 'User Research'], filled: true },
    ],
    members: [
      { handle: 'harsh_r', name: 'Harsh Raj', avatar: 'HR', role: 'Founder / Product' },
      { handle: 'amna_s', name: 'Amna Sehgal', avatar: 'AS', role: 'Frontend Engineer' },
      { handle: 'ayush_k', name: 'Ayush Kumar', avatar: 'AK', role: 'Backend Engineer' },
    ],
    college: 'NSUT / IGDTUW / IIIT Delhi',
    githubUrl: 'github.com/nearnow',
    tasks: [
      { label: 'Landing page + design system', done: true },
      { label: 'Activity feed (frontend)', done: true },
      { label: 'Auth (sign in / join)', done: false },
      { label: 'User profiles', done: false },
      { label: 'Project pages', done: false },
      { label: 'Backend API', done: false },
      { label: 'Real-time updates', done: false },
    ],
    timestamp: '3 weeks ago',
    owner: 'harsh_r',
    xpReward: 200,
    applicants: 14,
  },
  {
    id: 'p-002',
    name: 'MediAlert',
    tagline: 'Medication reminder app for patients and caregivers',
    description: 'A cross-platform mobile app that helps patients track medications, get smart reminders, and lets caregivers monitor adherence. Built for the 40% of Indians who miss doses due to poor tracking.',
    stack: ['React Native', 'Node.js', 'MongoDB', 'Expo'],
    category: 'HealthTech',
    status: 'active',
    openRoles: [
      { role: 'Backend Developer', skills: ['Node.js', 'MongoDB'], filled: false },
      { role: 'React Native Developer', skills: ['React Native', 'Expo'], filled: false },
    ],
    members: [
      { handle: 'sara_m', name: 'Sara Mehta', avatar: 'SM', role: 'Founder' },
    ],
    college: 'Jamia',
    tasks: [
      { label: 'App wireframes', done: true },
      { label: 'Auth flow', done: true },
      { label: 'Reminder engine', done: false },
      { label: 'Caregiver dashboard', done: false },
      { label: 'Push notifications', done: false },
    ],
    timestamp: '1 week ago',
    owner: 'sara_m',
    xpReward: 150,
    applicants: 7,
  },
  {
    id: 'p-003',
    name: 'EcoTrack',
    tagline: 'Carbon footprint monitor for everyday Indians',
    description: 'Tracks your daily carbon footprint based on transport, food, and energy usage. Built as HackDelhi 2026 winner. Now turning into a real product with gamification and community challenges.',
    stack: ['React', 'Python', 'FastAPI', 'MongoDB', 'TensorFlow'],
    category: 'ClimaTech',
    status: 'active',
    openRoles: [
      { role: 'Frontend Developer', skills: ['React', 'Data Viz', 'D3.js'], filled: false },
      { role: 'DevOps Engineer', skills: ['Docker', 'AWS', 'CI/CD'], filled: false },
    ],
    members: [
      { handle: 'priya_sh', name: 'Priya Sharma', avatar: 'PS', role: 'Founder / Full-stack' },
    ],
    college: 'DTU',
    githubUrl: 'github.com/ecotrack-in',
    liveUrl: 'ecotrack.in',
    tasks: [
      { label: 'Core tracking engine', done: true },
      { label: 'Dashboard UI', done: true },
      { label: 'Gamification layer', done: false },
      { label: 'Community challenges', done: false },
      { label: 'Mobile app', done: false },
    ],
    timestamp: '2 weeks ago',
    owner: 'priya_sh',
    xpReward: 180,
    applicants: 11,
  },
  {
    id: 'p-004',
    name: 'SkillMap India',
    tagline: 'AI-powered skill gap analyzer for students',
    description: 'Paste your resume or LinkedIn, pick your target role, and SkillMap tells you exactly what skills to build — with a personalised learning roadmap and curated resources from Indian ed-tech platforms.',
    stack: ['Next.js', 'Python', 'Gemini API', 'PostgreSQL', 'Tailwind'],
    category: 'EdTech',
    status: 'building',
    openRoles: [
      { role: 'Backend Developer', skills: ['Python', 'FastAPI', 'PostgreSQL'], filled: false },
      { role: 'AI/ML Engineer', skills: ['LLMs', 'Gemini API', 'LangChain'], filled: false },
      { role: 'Frontend Developer', skills: ['Next.js', 'React', 'TypeScript'], filled: false },
    ],
    members: [
      { handle: 'rohan_d', name: 'Rohan Dev', avatar: 'RD', role: 'Founder' },
    ],
    college: 'NSUT',
    tasks: [
      { label: 'Product spec', done: true },
      { label: 'LLM prompt design', done: true },
      { label: 'Resume parser', done: false },
      { label: 'Roadmap generator', done: false },
      { label: 'Frontend UI', done: false },
    ],
    timestamp: '3 days ago',
    owner: 'rohan_d',
    xpReward: 160,
    applicants: 19,
  },
  {
    id: 'p-005',
    name: 'CampusConnect',
    tagline: 'Lost-and-found + campus essentials super-app',
    description: 'Started as a lost-and-found board for college students. Now expanding into a campus essentials super-app — notes sharing, hostel marketplace, event RSVP, and alumni connect.',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
    category: 'Campus Life',
    status: 'active',
    openRoles: [
      { role: 'UI/UX Designer', skills: ['Figma', 'Mobile Design'], filled: false },
    ],
    members: [
      { handle: 'ayush_k', name: 'Ayush Kumar', avatar: 'AK', role: 'Founder / Backend' },
    ],
    college: 'IIIT Delhi',
    githubUrl: 'github.com/campusconnect',
    tasks: [
      { label: 'Lost-and-found core', done: true },
      { label: 'Auth + profiles', done: true },
      { label: 'Notes marketplace', done: false },
      { label: 'Event RSVP', done: false },
      { label: 'Alumni connect', done: false },
    ],
    timestamp: '5 days ago',
    owner: 'ayush_k',
    xpReward: 140,
    applicants: 6,
  },
];

export const PROJECT_CATEGORIES = ['All', 'EdTech', 'HealthTech', 'ClimaTech', 'Campus Life', 'FinTech', 'AI / ML', 'Open Source'];
export const ALL_STACKS = ['React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'PostgreSQL', 'React Native', 'Flutter', 'Docker', 'AWS', 'Figma', 'TensorFlow', 'FastAPI'];
export const ALL_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer', 'Data Scientist'];