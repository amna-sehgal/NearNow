export type ActivityType = 
  | 'joined_project'
  | 'earned_xp'
  | 'won_hackathon'
  | 'deployed'
  | 'looking_for'
  | 'completed_mission'
  | 'started_project'
  | 'contributed_oss';

export interface Activity {
  id: string;
  type: ActivityType;
  user: { name: string; handle: string; avatar: string; college: string; };
  content: string;
  meta?: string;
  tags?: string[];
  xp?: number;
  timestamp: string;
  isFresh?: boolean;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stack: string[];
  roles: string[];
  members: number;
  category: string;
  college: string;
  timestamp: string;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'earned_xp',
    user: { name: 'Amna Sehgal', handle: 'amna_s', avatar: 'AS', college: 'IGDTUW' },
    content: 'completed Skill Mission: Build a REST API with Auth',
    xp: 100,
    tags: ['Node.js', 'JWT', 'Express'],
    timestamp: '2m ago',
    isFresh: true,
  },
  {
    id: '2',
    type: 'joined_project',
    user: { name: 'Harsh Raj', handle: 'harsh_r', avatar: 'HR', college: 'NSUT' },
    content: 'joined AI Study Assistant',
    meta: 'needs React Dev · UI/UX Designer',
    tags: ['React', 'Python', 'OpenAI'],
    timestamp: '8m ago',
    isFresh: true,
  },
  {
    id: '3',
    type: 'won_hackathon',
    user: { name: 'Priya Sharma', handle: 'priya_sh', avatar: 'PS', college: 'DTU' },
    content: 'placed 1st at HackDelhi 2026',
    meta: 'Project: EcoTrack — Carbon footprint monitor',
    tags: ['Hackathon', 'Winner'],
    timestamp: '23m ago',
    isFresh: true,
  },
  {
    id: '4',
    type: 'deployed',
    user: { name: 'Ayush Kumar', handle: 'ayush_k', avatar: 'AK', college: 'IIIT Delhi' },
    content: 'deployed backend API for CampusConnect',
    meta: '12 endpoints · PostgreSQL · Docker',
    tags: ['Node.js', 'PostgreSQL'],
    timestamp: '1h ago',
  },
  {
    id: '5',
    type: 'looking_for',
    user: { name: 'Sara Mehta', handle: 'sara_m', avatar: 'SM', college: 'Jamia' },
    content: 'looking for a Backend Developer',
    meta: 'Project: MediAlert — medication reminder app',
    tags: ['Node.js', 'MongoDB', 'React Native'],
    timestamp: '2h ago',
  },
  {
    id: '6',
    type: 'started_project',
    user: { name: 'Rohan Dev', handle: 'rohan_d', avatar: 'RD', college: 'NSUT' },
    content: 'started a new project: SkillMap India',
    meta: 'AI-powered skill gap analyzer for students',
    tags: ['Next.js', 'Python', 'Gemini'],
    timestamp: '3h ago',
  },
  {
    id: '7',
    type: 'contributed_oss',
    user: { name: 'Neha Singh', handle: 'neha_s', avatar: 'NS', college: 'DTU' },
    content: 'merged 3 PRs into open-source project',
    meta: 'GSSoC 2026 — 340 XP total this week',
    tags: ['Open Source', 'GSSoC'],
    xp: 80,
    timestamp: '5h ago',
  },
  {
    id: '8',
    type: 'completed_mission',
    user: { name: 'Arjun Verma', handle: 'arjun_v', avatar: 'AV', college: 'IIT Delhi' },
    content: 'completed Skill Mission: Deploy with Docker',
    xp: 120,
    tags: ['Docker', 'DevOps', 'CI/CD'],
    timestamp: '6h ago',
  },
];

export const STATS = [
  { value: '2,400+', label: 'Active Builders' },
  { value: '380+', label: 'Live Projects' },
  { value: '140+', label: 'Colleges' },
  { value: '60+', label: 'Hackathon Teams' },
];

export const TICKER_ITEMS = [
  'Harsh joined an AI project',
  'Priya won HackDelhi 2026',
  'New project needs React Dev',
  'Sara earned 200 XP today',
  'SkillMap India is live',
  'Ayush deployed backend API',
  '12 new opportunities added',
  'Neha merged 3 OSS PRs',
  'CampusConnect needs UI designer',
  'Arjun completed DevOps mission',
];
