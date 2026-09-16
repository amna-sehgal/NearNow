'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/hooks';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { Plus, Search, SlidersHorizontal, Users, ChevronRight } from 'lucide-react';

const CATEGORIES = ['All', 'EdTech', 'HealthTech', 'ClimaTech', 'Campus Life', 'FinTech', 'AI / ML', 'Open Source'];
const ALL_STACKS = ['React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'PostgreSQL', 'React Native', 'Flutter', 'Docker', 'AWS', 'Figma', 'TensorFlow', 'FastAPI'];
const ALL_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer', 'Data Scientist'];

function ProjectCard({ project, isOwner }: { project: any; isOwner?: boolean }) {
  const tasks = project.tasks || [];
  const openRoles = (project.open_roles || []).filter((r: any) => !r.filled);
  const doneCount = tasks.filter((t: any) => t.done).length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const members = project.members || [];

  return (
    <Link href={`/projects/${project.id}`}
      className="card-hover flex flex-col p-5 rounded-xl border group"
      style={{ background: '#141416', borderColor: isOwner ? 'rgba(200,241,53,0.15)' : '#2A2A30' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>{project.name}</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: project.status === 'building' ? 'rgba(200,241,53,0.1)' : 'rgba(155,184,42,0.1)', color: project.status === 'building' ? '#C8F135' : '#9BB82A', border: `1px solid ${project.status === 'building' ? 'rgba(200,241,53,0.2)' : 'rgba(155,184,42,0.2)'}` }}>
              {project.status}
            </span>
            {isOwner && <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#1C1C20', color: '#7A7A8C', border: '1px solid #2A2A30' }}>yours</span>}
          </div>
          <p className="font-body text-xs" style={{ color: '#7A7A8C' }}>{project.tagline}</p>
        </div>
        <ChevronRight size={14} style={{ color: '#3A3A46' }} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform mt-1" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.stack?.slice(0, 4).map((s: string) => <Tag key={s} label={s} />)}
        {project.stack?.length > 4 && <Tag label={`+${project.stack.length - 4}`} />}
      </div>

      {tasks.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>Progress</span>
            <span className="font-mono text-[10px]" style={{ color: '#C8F135' }}>{progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1C1C20' }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #9BB82A, #C8F135)' }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {members.slice(0, 3).map((m: any, i: number) => (
            <div key={m.handle || i} style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: 3 - i }}>
              <Avatar initials={m.avatar || m.name?.slice(0,2) || 'NN'} size="sm" />
            </div>
          ))}
          {members.length > 3 && <span className="ml-2 font-mono text-[10px]" style={{ color: '#7A7A8C' }}>+{members.length - 3}</span>}
        </div>
        {openRoles.length > 0 && (
          <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded-full"
            style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.15)', color: '#C8F135' }}>
            <Users size={9} />{openRoles.length} open role{openRoles.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const { profile } = useProfile();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stackFilter, setStackFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const myProjects = projects.filter(p => p.owner_id === profile?.id);
  const otherProjects = projects.filter(p => p.owner_id !== profile?.id);

  const applyFilters = (list: any[]) => list.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.tagline?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category?.includes(category);
    const matchStack = !stackFilter || p.stack?.includes(stackFilter);
    const matchRole = !roleFilter || p.open_roles?.some((r: any) => r.role === roleFilter && !r.filled);
    return matchSearch && matchCat && matchStack && matchRole;
  });

  const isFiltering = search || category !== 'All' || stackFilter || roleFilter;
  const filteredAll = applyFilters(projects);
  const filteredOther = applyFilters(otherProjects);

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-20 border-b px-4 md:px-8"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <div className="h-14 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3A3A46' }} />
            <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-4 rounded-lg font-body text-sm outline-none transition-all"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
              onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg font-body text-sm transition-all flex-shrink-0"
            style={{ background: showFilters ? 'rgba(200,241,53,0.08)' : '#141416', border: `1px solid ${showFilters ? 'rgba(200,241,53,0.3)' : '#2A2A30'}`, color: showFilters ? '#C8F135' : '#7A7A8C' }}>
            <SlidersHorizontal size={13} /><span className="hidden sm:inline">Filters</span>
          </button>
          <Link href="/projects/create"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg font-display font-medium text-sm flex-shrink-0 transition-all"
            style={{ background: '#C8F135', color: '#0D0D0F' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
          ><Plus size={14} /><span className="hidden sm:inline">New Project</span></Link>
        </div>

        <div className="pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="h-7 px-3 rounded-full font-mono text-xs whitespace-nowrap transition-all flex-shrink-0"
              style={{ background: category === cat ? 'rgba(200,241,53,0.12)' : '#141416', border: `1px solid ${category === cat ? 'rgba(200,241,53,0.4)' : '#2A2A30'}`, color: category === cat ? '#C8F135' : '#7A7A8C' }}
            >{cat}</button>
          ))}
        </div>

        {showFilters && (
          <div className="pb-4 flex gap-3 flex-wrap">
            <select value={stackFilter} onChange={e => setStackFilter(e.target.value)}
              className="h-8 px-3 rounded-lg font-mono text-xs outline-none"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: stackFilter ? '#C8F135' : '#7A7A8C' }}>
              <option value="">Any stack</option>
              {ALL_STACKS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="h-8 px-3 rounded-lg font-mono text-xs outline-none"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: roleFilter ? '#C8F135' : '#7A7A8C' }}>
              <option value="">Any open role</option>
              {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {(stackFilter || roleFilter) && (
              <button onClick={() => { setStackFilter(''); setRoleFilter(''); }}
                className="h-8 px-3 rounded-lg font-mono text-xs transition-all"
                style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#7A7A8C' }}>
                Clear
              </button>
            )}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-xl border animate-pulse" style={{ background: '#141416', borderColor: '#2A2A30' }} />)}
          </div>
        ) : (
          <>
            {/* My projects — only when not filtering */}
            {!isFiltering && myProjects.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-xs" style={{ color: '#C8F135' }}>YOUR PROJECTS</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.15)' }}>{myProjects.length}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {myProjects.map(p => <ProjectCard key={p.id} project={p} isOwner />)}
                </div>
              </div>
            )}

            {/* All / filtered projects */}
            {!isFiltering && <span className="font-mono text-xs mb-4 block" style={{ color: '#7A7A8C' }}>ALL PROJECTS</span>}

            {(isFiltering ? filteredAll : filteredOther).length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display text-lg" style={{ color: '#3A3A46' }}>
                  {projects.length === 0 ? 'No projects yet.' : 'No projects match.'}
                </p>
                <p className="font-body text-sm mt-1 mb-6" style={{ color: '#3A3A46' }}>
                  {projects.length === 0 ? 'Be the first to start one.' : 'Try different filters.'}
                </p>
                <Link href="/projects/create" className="font-display font-semibold text-sm px-5 py-2.5 rounded-xl" style={{ background: '#C8F135', color: '#0D0D0F' }}>
                  Start a project
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {(isFiltering ? filteredAll : filteredOther).map(p => (
                  <ProjectCard key={p.id} project={p} isOwner={p.owner_id === profile?.id} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}