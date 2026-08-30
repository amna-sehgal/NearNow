// src/app/(app)/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Check, Loader2, AlertCircle, LogIn } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { getCurrentUser } from '@/lib/actions/auth';
import { updateProfile } from '@/lib/actions/profile';

const SUGGESTED_SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'Figma', 'TailwindCSS', 'FastAPI', 'Flutter', 'TensorFlow', 'AWS', 'Redis'];
const SUGGESTED_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer', 'Data Scientist', 'Product Manager'];
const COLLEGES = ['IGDTUW', 'DTU', 'NSUT', 'IIIT Delhi', 'IIT Delhi', 'Jamia', 'IP University', 'Amity', 'BIT Mesra', 'NIT Trichy', 'Other Indian College'];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [handle, setHandle] = useState<string>('builder');
  const [avatar, setAvatar] = useState<string>('SB');

  const [form, setForm] = useState({
    name: '',
    bio: '',
    college: 'IGDTUW',
    year: '',
    location: '',
    github: '',
    linkedin: '',
    portfolio: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    async function loadAuthProfile() {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const p = currentUser.profile;
        setHandle(p.handle || 'builder');
        setAvatar(p.avatar || 'SB');

        setForm({
          name: p.name || '',
          bio: p.bio || '',
          college: p.college || 'IGDTUW',
          year: p.year || '',
          location: p.location || '',
          github: p.github || p.links?.github || '',
          linkedin: p.linkedin || p.links?.linkedin || '',
          portfolio: p.portfolio || p.links?.portfolio || '',
        });

        setSkills(p.skills || []);
        setLookingFor(p.looking_for || p.lookingFor || []);
      } catch (err) {
        console.error('[EditProfilePage Error]:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAuthProfile();
  }, []);

  const addSkill = (s: string) => {
    const clean = s.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));

  const toggleRole = (r: string) => {
    setLookingFor(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    setErrorMsg(null);
    setSaving(true);

    try {
      const res = await updateProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
        college: form.college,
        year: form.year.trim(),
        location: form.location.trim(),
        github: form.github.trim(),
        linkedin: form.linkedin.trim(),
        portfolio: form.portfolio.trim(),
        skills,
        lookingFor,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setErrorMsg('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3" style={{ background: '#0D0D0F' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#C8F135' }} />
        <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>Loading profile editor...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#0D0D0F' }}>
        <div className="text-center max-w-sm border rounded-2xl p-8" style={{ background: '#141416', borderColor: '#2A2A30' }}>
          <LogIn size={28} className="mx-auto mb-4" style={{ color: '#C8F135' }} />
          <h2 className="font-display font-bold text-xl mb-2" style={{ color: '#E8E8F0' }}>Sign in required</h2>
          <p className="font-body text-xs mb-6" style={{ color: '#7A7A8C' }}>You must be logged in to edit your profile.</p>
          <Link
            href="/auth"
            className="font-display font-semibold text-xs px-5 py-2.5 rounded-xl block transition-all"
            style={{ background: '#C8F135', color: '#0D0D0F' }}
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header
        className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center justify-between"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}
      >
        <Link href={`/profile/${handle}`} className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Profile
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-8 px-4 rounded-lg font-display font-medium text-xs transition-all"
          style={{ background: saved ? '#1a2a0a' : '#C8F135', color: saved ? '#C8F135' : '#0D0D0F', border: saved ? '1px solid rgba(200,241,53,0.3)' : 'none', opacity: saving ? 0.7 : 1 }}
          onMouseEnter={e => { if (!saved && !saving) e.currentTarget.style.background = '#d4f547'; }}
          onMouseLeave={e => { if (!saved && !saving) e.currentTarget.style.background = '#C8F135'; }}
        >
          {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : saved ? <><Check size={12} /> Saved!</> : 'Save changes'}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        {errorMsg && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl border font-body text-xs leading-relaxed"
            style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171' }}
          >
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar initials={avatar} size="lg" glow />
          <div>
            <p className="font-display font-medium text-sm" style={{ color: '#E8E8F0' }}>@{handle}</p>
            <p className="font-body text-xs mt-0.5" style={{ color: '#7A7A8C' }}>Avatar generated automatically from your initials.</p>
          </div>
        </div>

        {/* Basic info */}
        <Section title="BASIC INFO">
          <Field label="Full name">
            <Input value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Your name" />
          </Field>
          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Tell builders what you're building..."
              className="w-full px-3 py-2.5 rounded-xl font-body text-sm outline-none resize-none transition-all"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
              onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="College">
              <select
                value={form.college}
                onChange={e => setForm({ ...form, college: e.target.value })}
                className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all appearance-none"
                style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              >
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={v => setForm({ ...form, location: v })} placeholder="Delhi, Bangalore, etc." />
            </Field>
          </div>
          <Field label="Year & Degree">
            <Input value={form.year} onChange={v => setForm({ ...form, year: v })} placeholder="2nd Year B.Tech CSE" />
          </Field>
        </Section>

        {/* Skills */}
        <Section title="SKILLS">
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', color: '#C8F135' }}>
                {s}
                <button type="button" onClick={() => removeSkill(s)}><X size={10} style={{ color: '#9BB82A' }} /></button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a skill and press Enter"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); }}}
            className="w-full h-9 px-3 rounded-xl font-mono text-sm outline-none transition-all mb-3"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
          />
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map(s => (
              <button key={s} type="button" onClick={() => addSkill(s)}
                className="font-mono text-[11px] px-2 py-0.5 rounded-full border transition-all"
                style={{ background: '#141416', borderColor: '#2A2A30', color: '#7A7A8C' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >
                + {s}
              </button>
            ))}
          </div>
        </Section>

        {/* Looking for */}
        <Section title="LOOKING TO COLLABORATE WITH">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_ROLES.map(r => {
              const active = lookingFor.includes(r);
              return (
                <button key={r} type="button" onClick={() => toggleRole(r)}
                  className="font-mono text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    background: active ? 'rgba(200,241,53,0.1)' : '#141416',
                    borderColor: active ? 'rgba(200,241,53,0.35)' : '#2A2A30',
                    color: active ? '#C8F135' : '#7A7A8C',
                  }}
                >
                  {active && <Check size={10} className="inline mr-1" />}
                  {r}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Links */}
        <Section title="LINKS">
          <Field label="GitHub"><Input value={form.github} onChange={v => setForm({ ...form, github: v })} placeholder="github.com/username" /></Field>
          <Field label="LinkedIn"><Input value={form.linkedin} onChange={v => setForm({ ...form, linkedin: v })} placeholder="linkedin.com/in/username" /></Field>
          <Field label="Portfolio"><Input value={form.portfolio} onChange={v => setForm({ ...form, portfolio: v })} placeholder="yoursite.com" /></Field>
        </Section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 rounded-xl font-display font-semibold text-sm transition-all flex items-center justify-center gap-2"
          style={{ background: '#C8F135', color: '#0D0D0F', opacity: saving ? 0.7 : 1 }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#d4f547'; }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#C8F135'; }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving to Database...
            </>
          ) : saved ? (
            '✓ Saved!'
          ) : (
            'Save changes'
          )}
        </button>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ background: '#141416', borderColor: '#2A2A30' }}>
      <h2 className="font-mono text-xs" style={{ color: '#7A7A8C' }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px]" style={{ color: '#7A7A8C' }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all"
      style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
      onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
      onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
    />
  );
}