'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/hooks';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import { MapPin, GraduationCap, Filter, Check, Clock } from 'lucide-react';
import { CANONICAL_COLLEGES } from '@/lib/constants';

function computeMatch(me: any, other: any): number {
  if (!me || !other) return 0;
  let score = 0;
  const mySkills: string[] = me.skills || [];
  const otherSkills: string[] = other.skills || [];
  const myLooking: string[] = me.looking_for || [];
  const otherLooking: string[] = other.looking_for || [];
  const skillOverlap = mySkills.filter(s => otherSkills.includes(s)).length;
  score += Math.min(skillOverlap * 10, 30);
  const iNeedThem = myLooking.some(r =>
    otherSkills.some(s => s.toLowerCase().includes(r.toLowerCase().split(' ')[0]))
  );
  if (iNeedThem) score += 35;
  const theyNeedMe = otherLooking.some(r =>
    mySkills.some(s => s.toLowerCase().includes(r.toLowerCase().split(' ')[0]))
  );
  if (theyNeedMe) score += 35;
  if (me.college && other.college && me.college === other.college) score += 10;
  if (other.xp > 100) score += 10;
  return Math.min(score, 99);
}

type ConnStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer', 'Data Scientist'];
const STACKS = ['React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Flutter', 'Docker', 'TensorFlow', 'FastAPI'];
const COLLEGES = CANONICAL_COLLEGES;

export default function MatchPage() {
  const { profile, user } = useProfile();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [connStatuses, setConnStatuses] = useState<Record<string, ConnStatus>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [stackFilter, setStackFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const supabase = createClient();

      const [{ data: profiles }, { data: conns }] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .limit(50),
        supabase
          .from('connections')
          .select('sender_id, receiver_id, status')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
      ]);

      // Build status map for every connection
      const statusMap: Record<string, ConnStatus> = {};
      (conns || []).forEach((c: any) => {
        const otherId = c.sender_id === user.id ? c.receiver_id : c.sender_id;
        if (c.status === 'connected') {
          statusMap[otherId] = 'connected';
        } else if (c.status === 'pending') {
          statusMap[otherId] = c.sender_id === user.id ? 'pending_sent' : 'pending_received';
        }
      });

      setConnStatuses(statusMap);
      setMatches(profiles || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleConnect = async (otherId: string, otherName: string, otherHandle: string) => {
    if (!user || !profile) return;
    setActing(otherId);
    const supabase = createClient();

    await supabase.from('connections').insert({
      sender_id: user.id,
      receiver_id: otherId,
      status: 'pending',
    });

    await supabase.from('notifications').insert({
      user_id: otherId,
      type: 'connection_request',
      title: 'New connection request',
      body: `${profile.name} wants to connect with you`,
      link: `/profile/${profile.handle}`,
      read: false,
    });

    // Update status immediately — show Requested, not Connected
    setConnStatuses(prev => ({ ...prev, [otherId]: 'pending_sent' }));
    setActing(null);
  };

  const processed = matches
    .map(m => ({ ...m, matchScore: computeMatch(profile, m) }))
    .filter(m => {
      const matchRole = !roleFilter || m.looking_for?.some((r: string) => r === roleFilter);
      const matchStack = !stackFilter || m.skills?.includes(stackFilter);
      const matchCollege = !collegeFilter || m.college === collegeFilter;
      return matchRole && matchStack && matchCollege;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const scoreColor = (score: number) => {
    if (score >= 80) return '#C8F135';
    if (score >= 60) return '#9BB82A';
    if (score >= 40) return '#7A7A8C';
    return '#3A3A46';
  };

  const renderConnButton = (person: any) => {
    const status = connStatuses[person.id] || 'none';
    const isActing = acting === person.id;

    if (status === 'connected') {
      return (
        <span className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: 'rgba(200,241,53,0.08)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.2)' }}>
          <Check size={11} /> Connected
        </span>
      );
    }
    if (status === 'pending_sent') {
      return (
        <span className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: '#1C1C20', color: '#7A7A8C', border: '1px solid #2A2A30' }}>
          <Clock size={11} /> Requested
        </span>
      );
    }
    if (status === 'pending_received') {
      return (
        <span className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: 'rgba(200,241,53,0.06)', color: '#9BB82A', border: '1px solid rgba(200,241,53,0.15)' }}>
          Wants to connect
        </span>
      );
    }
    return (
      <button
        onClick={() => handleConnect(person.id, person.name, person.handle)}
        disabled={isActing}
        className="font-display font-medium text-xs px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
        style={{ background: isActing ? '#9BB82A' : '#C8F135', color: '#0D0D0F' }}
        onMouseEnter={e => { if (!isActing) e.currentTarget.style.background = '#d4f547'; }}
        onMouseLeave={e => { if (!isActing) e.currentTarget.style.background = '#C8F135'; }}
      >
        {isActing ? 'Sending...' : 'Connect'}
      </button>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-20 border-b px-4 md:px-8"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <div className="h-14 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-base" style={{ color: '#E8E8F0' }}>Collaboration Match</h1>
            <p className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>
              {loading ? 'Finding matches...' : `${processed.length} builders matched`}
            </p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg font-body text-sm transition-all"
            style={{
              background: showFilters ? 'rgba(200,241,53,0.08)' : '#141416',
              border: `1px solid ${showFilters ? 'rgba(200,241,53,0.3)' : '#2A2A30'}`,
              color: showFilters ? '#C8F135' : '#7A7A8C',
            }}>
            <Filter size={13} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="pb-4 flex gap-3 flex-wrap">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="h-8 px-3 rounded-lg font-mono text-xs outline-none"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: roleFilter ? '#C8F135' : '#7A7A8C' }}>
              <option value="">Looking for any role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={stackFilter} onChange={e => setStackFilter(e.target.value)}
              className="h-8 px-3 rounded-lg font-mono text-xs outline-none"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: stackFilter ? '#C8F135' : '#7A7A8C' }}>
              <option value="">Any stack</option>
              {STACKS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={collegeFilter} onChange={e => setCollegeFilter(e.target.value)}
              className="h-8 px-3 rounded-lg font-mono text-xs outline-none"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: collegeFilter ? '#C8F135' : '#7A7A8C' }}>
              <option value="">Any college</option>
              {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(roleFilter || stackFilter || collegeFilter) && (
              <button onClick={() => { setRoleFilter(''); setStackFilter(''); setCollegeFilter(''); }}
                className="h-8 px-3 rounded-lg font-mono text-xs"
                style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#7A7A8C' }}>
                Clear
              </button>
            )}
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6">
        {(profile?.looking_for?.length ?? 0) > 0 && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: '#141416', borderColor: 'rgba(200,241,53,0.15)' }}>
            <p className="font-mono text-[10px] mb-2" style={{ color: '#C8F135' }}>MATCHING YOU WITH</p>
            <div className="flex flex-wrap gap-2">
              {(profile?.looking_for ?? []).map((r: string) => <Tag key={r} label={r} variant="volt" />)}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-2xl border animate-pulse"
                style={{ background: '#141416', borderColor: '#2A2A30' }} />
            ))}
          </div>
        ) : processed.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-lg" style={{ color: '#3A3A46' }}>No matches found.</p>
            <p className="font-body text-sm mt-1" style={{ color: '#3A3A46' }}>
              Update your skills and looking-for on your profile to get better matches.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {processed.map((person, i) => {
              const score = person.matchScore;
              const mySkills: string[] = profile?.skills || [];
              const sharedSkills = (person.skills || []).filter((s: string) => mySkills.includes(s));
              const theyHaveWhatINeed = (profile?.looking_for || []).filter((r: string) =>
                (person.skills || []).some((s: string) => s.toLowerCase().includes(r.toLowerCase().split(' ')[0]))
              );

              return (
                <div key={person.id}
                  className="rounded-2xl border p-5 transition-all duration-500"
                  style={{
                    background: '#141416',
                    borderColor: score >= 70 ? 'rgba(200,241,53,0.2)' : '#2A2A30',
                    opacity: 0,
                    animation: `float-up 0.5s ease forwards`,
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center border"
                        style={{
                          background: `rgba(${score >= 70 ? '200,241,53' : score >= 50 ? '155,184,42' : '42,42,48'},0.08)`,
                          borderColor: `rgba(${score >= 70 ? '200,241,53' : score >= 50 ? '155,184,42' : '42,42,48'},0.25)`,
                        }}>
                        <span className="font-display font-bold text-lg leading-none" style={{ color: scoreColor(score) }}>{score}</span>
                        <span className="font-mono text-[8px]" style={{ color: scoreColor(score) }}>%</span>
                      </div>
                      <span className="font-mono text-[8px]" style={{ color: '#3A3A46' }}>match</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar initials={person.avatar || person.name?.slice(0, 2).toUpperCase() || 'NN'} size="md" />
                          <div>
                            <h3 className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>{person.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="font-mono text-[10px]" style={{ color: '#C8F135' }}>@{person.handle}</span>
                              {person.college && (
                                <><span style={{ color: '#2A2A30' }}>·</span>
                                  <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: '#7A7A8C' }}>
                                    <GraduationCap size={9} />{person.college}
                                  </span></>
                              )}
                              {person.location && (
                                <><span style={{ color: '#2A2A30' }}>·</span>
                                  <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: '#7A7A8C' }}>
                                    <MapPin size={9} />{person.location}
                                  </span></>
                              )}
                            </div>
                          </div>
                        </div>
                        {renderConnButton(person)}
                      </div>

                      {person.bio && (
                        <p className="font-body text-xs mb-3 leading-relaxed" style={{ color: '#7A7A8C' }}>
                          {person.bio.slice(0, 120)}{person.bio.length > 120 ? '...' : ''}
                        </p>
                      )}

                      <div className="flex flex-col gap-2">
                        {sharedSkills.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] flex-shrink-0" style={{ color: '#3A3A46' }}>shared:</span>
                            {sharedSkills.slice(0, 4).map((s: string) => <Tag key={s} label={s} variant="dim" />)}
                          </div>
                        )}
                        {theyHaveWhatINeed.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] flex-shrink-0" style={{ color: '#C8F135' }}>you need:</span>
                            {theyHaveWhatINeed.slice(0, 3).map((r: string) => <Tag key={r} label={r} variant="volt" />)}
                          </div>
                        )}
                        {person.skills?.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] flex-shrink-0" style={{ color: '#3A3A46' }}>skills:</span>
                            {person.skills.slice(0, 4).map((s: string) => <Tag key={s} label={s} />)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>
                          Rep <span style={{ color: '#C8F135' }}>{person.reputation}</span>
                        </span>
                        <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>
                          XP <span style={{ color: '#9BB82A' }}>{person.xp}</span>
                        </span>
                        {person.year && (
                          <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>{person.year}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}