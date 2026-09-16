'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/hooks';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import ActivityCard from '@/components/ui/ActivityCard';
import { Globe, MapPin, GraduationCap, Edit3, Star, ExternalLink } from 'lucide-react';

function GithubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function LinkedinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl border" style={{ background: '#141416', borderColor: '#2A2A30' }}>
      <span className="font-display font-bold text-xl" style={{ color: '#C8F135' }}>{value}</span>
      <span className="font-mono text-[10px] mt-0.5" style={{ color: '#7A7A8C' }}>{label}</span>
    </div>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const { profile: myProfile, user } = useProfile();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isMe = myProfile?.handle === handle;

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('handle', handle)
        .single();

      if (!profileData) { setLoading(false); return; }
      setProfile(profileData);

      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .contains('members', JSON.stringify([{ handle }]))
        .order('created_at', { ascending: false });

      // Also fetch owned projects
      const { data: ownedProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', profileData.id)
        .order('created_at', { ascending: false });

      const allProjects = [...(ownedProjects || []), ...(projectData || [])];
      const unique = allProjects.filter((p, i, a) => a.findIndex(x => x.id === p.id) === i);
      setProjects(unique);

      const { data: activityData } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setActivities(activityData || []);
      setLoading(false);
    };
    fetch();
  }, [handle]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0F' }}>
      <div className="font-mono text-sm" style={{ color: '#7A7A8C' }}>Loading profile...</div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0F' }}>
      <div className="text-center">
        <p className="font-display text-lg" style={{ color: '#3A3A46' }}>Profile not found.</p>
        <Link href="/feed" className="font-mono text-xs mt-2 block" style={{ color: '#7A7A8C' }}>← Back to feed</Link>
      </div>
    </div>
  );

  const xpPercent = Math.min((profile.xp / profile.xp_to_next) * 100, 100);

  const toCard = (a: any) => ({
    id: a.id, type: a.type,
    user: { name: profile.name, handle: profile.handle, avatar: profile.avatar || 'NN', college: profile.college || '' },
    content: a.content, meta: a.meta, tags: a.tags || [], xp: a.xp,
    timestamp: new Date(a.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
    isFresh: Date.now() - new Date(a.created_at).getTime() < 1000 * 60 * 30,
  });

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center justify-between"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>@{profile.handle}</span>
        {isMe && (
          <Link href="/profile/edit"
            className="flex items-center gap-2 h-8 px-3 rounded-lg font-body text-xs transition-all"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#7A7A8C' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
          >
            <Edit3 size={12} /> Edit profile
          </Link>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        {/* Identity card */}
        <div className="rounded-2xl border p-6" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <div className="flex items-start gap-4 mb-5">
            <Avatar initials={profile.avatar || profile.name?.slice(0,2).toUpperCase() || 'NN'} size="lg" glow />
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl" style={{ color: '#E8E8F0' }}>{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="font-mono text-xs" style={{ color: '#C8F135' }}>@{profile.handle}</span>
                {profile.college && <><span style={{ color: '#2A2A30' }}>·</span><span className="flex items-center gap-1 font-body text-xs" style={{ color: '#7A7A8C' }}><GraduationCap size={11} />{profile.college}</span></>}
                {profile.location && <><span style={{ color: '#2A2A30' }}>·</span><span className="flex items-center gap-1 font-body text-xs" style={{ color: '#7A7A8C' }}><MapPin size={11} />{profile.location}</span></>}
              </div>
              {profile.year && <p className="font-body text-xs mt-1" style={{ color: '#7A7A8C' }}>{profile.year}</p>}
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border"
                style={{ background: 'rgba(200,241,53,0.06)', borderColor: 'rgba(200,241,53,0.2)' }}>
                <Star size={14} style={{ color: '#C8F135' }} />
                <span className="font-display font-bold text-lg leading-tight" style={{ color: '#C8F135' }}>{profile.reputation}</span>
              </div>
              <span className="font-mono text-[9px] mt-1 block" style={{ color: '#7A7A8C' }}>REP</span>
            </div>
          </div>

          {profile.bio && <p className="font-body text-sm leading-relaxed mb-5" style={{ color: '#E8E8F0' }}>{profile.bio}</p>}

          {/* XP bar */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>XP Progress</span>
              <span className="font-mono text-xs" style={{ color: '#C8F135' }}>{profile.xp} / {profile.xp_to_next}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1C1C20' }}>
              <div className="h-full rounded-full" style={{ width: `${xpPercent}%`, background: 'linear-gradient(to right, #9BB82A, #C8F135)' }} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <StatPill value={projects.length} label="Projects" />
            <StatPill value={profile.reputation} label="Rep" />
            <StatPill value={profile.xp} label="XP" />
            <StatPill value={activities.length} label="Posts" />
          </div>

          {/* Links */}
          <div className="flex gap-3 flex-wrap">
            {profile.github && (
              <a href={`https://${profile.github}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              ><GithubIcon /> GitHub</a>
            )}
            {profile.linkedin && (
              <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              ><LinkedinIcon /> LinkedIn</a>
            )}
            {profile.portfolio && (
              <a href={`https://${profile.portfolio}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: '#2A2A30', color: '#7A7A8C', background: '#1C1C20' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              ><Globe size={12} /> Portfolio</a>
            )}
            {!isMe && (
              <button className="ml-auto flex items-center gap-1.5 font-display font-medium text-xs px-4 py-1.5 rounded-lg transition-all"
                style={{ background: '#C8F135', color: '#0D0D0F' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; }}
              >Connect</button>
            )}
          </div>
        </div>

        {/* Skills + Looking For */}
        {(profile.skills?.length > 0 || profile.looking_for?.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4">
            {profile.skills?.length > 0 && (
              <div className="rounded-2xl border p-5" style={{ background: '#141416', borderColor: '#2A2A30' }}>
                <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>SKILLS</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s: string) => <Tag key={s} label={s} variant="dim" />)}
                </div>
              </div>
            )}
            {profile.looking_for?.length > 0 && (
              <div className="rounded-2xl border p-5" style={{ background: '#141416', borderColor: '#2A2A30' }}>
                <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>LOOKING TO COLLABORATE WITH</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.looking_for.map((r: string) => <Tag key={r} label={r} variant="volt" />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>PROJECTS</h2>
            <div className="flex flex-col gap-3">
              {projects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`}
                  className="card-hover flex items-start gap-4 p-4 rounded-xl border"
                  style={{ background: '#141416', borderColor: '#2A2A30' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>{p.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.15)' }}>
                        {p.status}
                      </span>
                    </div>
                    <p className="font-body text-xs mb-2" style={{ color: '#7A7A8C' }}>{p.tagline}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.stack?.slice(0, 4).map((s: string) => <Tag key={s} label={s} />)}
                    </div>
                  </div>
                  <ExternalLink size={14} style={{ color: '#3A3A46', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        {activities.length > 0 && (
          <div>
            <h2 className="font-mono text-xs mb-4" style={{ color: '#7A7A8C' }}>RECENT ACTIVITY</h2>
            <div className="flex flex-col gap-3">
              {activities.map(a => <ActivityCard key={a.id} activity={toCard(a)} />)}
            </div>
          </div>
        )}

        {activities.length === 0 && projects.length === 0 && (
          <div className="text-center py-12 rounded-2xl border" style={{ borderColor: '#2A2A30', background: '#141416' }}>
            <p className="font-display text-base" style={{ color: '#3A3A46' }}>No activity yet.</p>
            <p className="font-body text-xs mt-1" style={{ color: '#3A3A46' }}>Complete a mission or join a project to appear in the feed.</p>
          </div>
        )}
      </main>
    </div>
  );
}