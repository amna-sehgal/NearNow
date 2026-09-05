'use server';

import { createClient } from '@/lib/supabase/server';

export interface Opportunity {
  id: string;
  title: string;
  companyOrOrg: string;
  type: 'Hackathon' | 'Grant' | 'Bounty' | 'Internship' | 'Fellowship';
  location: string;
  stipendOrPrize?: string;
  deadline: string;
  description: string;
  tags: string[];
  applyUrl: string;
  postedAt?: string;
}

const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-001',
    title: 'HackDelhi 2026 — National Student Hackathon',
    companyOrOrg: 'Delhi Tech Network & DevFolio',
    type: 'Hackathon',
    location: 'IIT Delhi Campus & Hybrid',
    stipendOrPrize: '₹5,000,000 Pool Prize',
    deadline: 'Oct 15, 2026',
    description: '36-hour hackathon focused on AI for India, ClimateTech, and Web3 infrastructure. Top 5 teams get incubator fast-track.',
    tags: ['Hackathon', 'AI', 'Next.js', 'Web3', 'Prize'],
    applyUrl: 'https://devfolio.co',
    postedAt: '2 days ago',
  },
  {
    id: 'opp-002',
    title: 'Open Source Student Fellowship 2026',
    companyOrOrg: 'OSSI India & GitHub Foundation',
    type: 'Fellowship',
    location: 'Remote (India)',
    stipendOrPrize: '₹40,000 / month stipend',
    deadline: 'Sep 30, 2026',
    description: '3-month paid open source fellowship for college undergraduates building developer tooling and public digital infrastructure.',
    tags: ['Fellowship', 'Open Source', 'Node.js', 'Python', 'Stipend'],
    applyUrl: 'https://github.com',
    postedAt: '4 days ago',
  },
  {
    id: 'opp-003',
    title: 'AI Micro-Grant for Student Founders',
    companyOrOrg: 'BuildFast Ventures',
    type: 'Grant',
    location: 'Remote',
    stipendOrPrize: '$2,500 Equity-free Grant',
    deadline: 'Rolling Applications',
    description: 'Equity-free grant for early-stage college teams building LLM applications, local AI models, or devtech tools.',
    tags: ['Grant', 'Equity-Free', 'AI', 'Startups'],
    applyUrl: 'https://buildfast.vc',
    postedAt: '1 week ago',
  },
  {
    id: 'opp-004',
    title: 'Frontend Engineer Intern (Next.js & Tailwind)',
    companyOrOrg: 'NearNow Labs',
    type: 'Internship',
    location: 'Delhi NCR / Remote',
    stipendOrPrize: '₹25,000 / month',
    deadline: 'Oct 01, 2026',
    description: 'Join NearNow engineering team to craft high-performance interactive interfaces, social graph components, and design systems.',
    tags: ['Internship', 'React', 'Next.js', 'TypeScript', 'Frontend'],
    applyUrl: 'https://nearnow.dev/careers',
    postedAt: '3 days ago',
  },
  {
    id: 'opp-005',
    title: 'Solana & Rust Developer Bounty',
    companyOrOrg: 'Superteam India',
    type: 'Bounty',
    location: 'Remote',
    stipendOrPrize: '$1,200 Bounty',
    deadline: 'Sep 25, 2026',
    description: 'Build a decentralized reputation & credential verification smart contract on Solana with TypeScript SDK integration.',
    tags: ['Bounty', 'Rust', 'Solana', 'Web3', 'Crypto'],
    applyUrl: 'https://superteam.fun',
    postedAt: '5 days ago',
  },
];

export async function fetchOpportunities(options?: {
  type?: string;
  search?: string;
}): Promise<Opportunity[]> {
  try {
    const supabase = await createClient();

    let query = supabase.from('opportunities').select('*').order('created_at', { ascending: false });

    if (options?.type && options.type !== 'All') {
      query = query.eq('type', options.type);
    }

    const { data: rows, error } = await query;

    if (error || !rows || rows.length === 0) {
      return OPPORTUNITIES.filter(o => {
        const matchType = !options?.type || options.type === 'All' || o.type === options.type;
        const matchSearch = !options?.search ||
          o.title.toLowerCase().includes(options.search.toLowerCase()) ||
          o.companyOrOrg.toLowerCase().includes(options.search.toLowerCase()) ||
          o.description.toLowerCase().includes(options.search.toLowerCase());
        return matchType && matchSearch;
      });
    }

    const mapped: Opportunity[] = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      companyOrOrg: r.company_or_org,
      type: r.type,
      location: r.location || 'Remote',
      stipendOrPrize: r.stipend_or_prize || undefined,
      deadline: r.deadline || 'Open',
      description: r.description,
      tags: r.tags || [],
      applyUrl: r.apply_url || '#',
      postedAt: 'Recently',
    }));

    if (options?.search) {
      const s = options.search.toLowerCase();
      return mapped.filter(o =>
        o.title.toLowerCase().includes(s) ||
        o.companyOrOrg.toLowerCase().includes(s) ||
        o.description.toLowerCase().includes(s)
      );
    }

    return mapped;
  } catch {
    return OPPORTUNITIES;
  }
}

export async function fetchOpportunityById(id: string): Promise<Opportunity | null> {
  try {
    const supabase = await createClient();

    const { data: r, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !r) {
      return OPPORTUNITIES.find(o => o.id === id) || null;
    }

    return {
      id: r.id,
      title: r.title,
      companyOrOrg: r.company_or_org,
      type: r.type,
      location: r.location || 'Remote',
      stipendOrPrize: r.stipend_or_prize || undefined,
      deadline: r.deadline || 'Open',
      description: r.description,
      tags: r.tags || [],
      applyUrl: r.apply_url || '#',
      postedAt: 'Recently',
    };
  } catch {
    return OPPORTUNITIES.find(o => o.id === id) || null;
  }
}
