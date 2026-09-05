'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Check } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/hooks';

const SUGGESTED_SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'Figma', 'TailwindCSS', 'FastAPI', 'Flutter', 'TensorFlow', 'AWS', 'Redis'];
const SUGGESTED_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer', 'Data Scientist', 'Product Manager'];
const COLLEGES = ['IGDTUW', 'DTU', 'NSUT', 'IIIT Delhi', 'IIT Delhi', 'Jamia', 'IP University', 'Amity', 'BIT Mesra', 'NIT Trichy', 'VIT', 'BITS Pilani'];

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, user, loading } = useProfile();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', bio: '', college: '', year: '', location: '', github: '', linkedin: '', portfolio: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', bio: profile.bio || '', college: profile.college || '', year: profile.year || '', location: profile.location || '', github: profile.github || '', linkedin: profile.linkedin || '', portfolio: profile.portfolio || '' });
      setSkills(profile.skills || []);
      setLookingFor(profile.looking_for || []);
    }
  }, [profile]);

  const addSkill = (s: string) => { const c = s.trim(); if (c && !skills.includes(c)) setSkills([...skills, c]); setSkillInput(''); };
  const removeSkill = (s: string) => setSkills(skills.filter(x => x !== s));
  const toggleRole = (r: string) => setLookingFor(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ ...form, skills, looking_for: lookingFor, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) { setError(updateError.message); setSaving(false); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push(`/profile/${profile?.handle}`); }, 1500);
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0F' }}>
      <div className="font-mono text-sm" style={{ color: '#7A7A8C' }}>Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <header className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center justify-between"
        style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
        <Link href={`/profile/${profile?.handle}`} className="flex items-center gap-2 font-body text-sm" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Profile
        </Link>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 h-8 px-4 rounded-lg font-display font-medium text-xs transition-all"
          style={{ background: saved ? '#1a2a0a' : '#C8F135', color: saved ? '#C8F135' : '#0D0D0F', border: saved ? '1px solid rgba(200,241,53,0.3)' : 'none' }}
          onMouseEnter={e => { if (!saving && !saved) e.currentTarget.style.background = '#d4f547'; }}
          onMouseLeave={e => { if (!saving && !saved) e.currentTarget.style.background = '#C8F135'; }}
        >
          {saved ? <><Check size={12} /> Saved!</> : saving ? 'Saving...' : 'Save changes'}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {error && (
          <div className="px-4 py-3 rounded-xl font-body text-sm" style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar initials={profile?.avatar || form.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'NN'} size="lg" glow />
          <div>
            <p className="font-display font-medium text-sm" style={{ color: '#E8E8F0' }}>Profile picture</p>
            <p className="font-body text-xs mt-0.5" style={{ color: '#7A7A8C' }}>Avatar generated from initials. Photo upload coming soon.</p>
          </div>
        </div>

        {/* Basic info */}
        <Section title="BASIC INFO">
          <Field label="Full name"><Input value={form.name} onChange={v => setForm({...form, name: v})} placeholder="Your name" /></Field>
          <Field label="Bio">
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} placeholder="Tell builders what you're about..."
              className="w-full px-3 py-2.5 rounded-xl font-body text-sm outline-none resize-none transition-all"
              style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
              onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="College">
              <select value={form.college} onChange={e => setForm({...form, college: e.target.value})}
                className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all appearance-none"
                style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
              >
                <option value="">Select college</option>
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Location"><Input value={form.location} onChange={v => setForm({...form, location: v})} placeholder="City" /></Field>
          </div>
          <Field label="Year & Degree"><Input value={form.year} onChange={v => setForm({...form, year: v})} placeholder="2nd Year B.Tech CSE" /></Field>
        </Section>

        {/* Skills */}
        <Section title="SKILLS">
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', color: '#C8F135' }}>
                {s}<button onClick={() => removeSkill(s)}><X size={10} style={{ color: '#9BB82A' }} /></button>
              </span>
            ))}
          </div>
          <input type="text" placeholder="Type a skill and press Enter" value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); }}}
            className="w-full h-9 px-3 rounded-xl font-mono text-sm outline-none transition-all mb-3"
            style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
          />
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map(s => (
              <button key={s} onClick={() => addSkill(s)}
                className="font-mono text-[11px] px-2 py-0.5 rounded-full border transition-all"
                style={{ background: '#141416', borderColor: '#2A2A30', color: '#7A7A8C' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
              >+ {s}</button>
            ))}
          </div>
        </Section>

        {/* Looking for */}
        <Section title="LOOKING TO COLLABORATE WITH">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_ROLES.map(r => {
              const active = lookingFor.includes(r);
              return (
                <button key={r} onClick={() => toggleRole(r)}
                  className="font-mono text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{ background: active ? 'rgba(200,241,53,0.1)' : '#141416', borderColor: active ? 'rgba(200,241,53,0.35)' : '#2A2A30', color: active ? '#C8F135' : '#7A7A8C' }}
                >
                  {active && <Check size={10} className="inline mr-1" />}{r}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Links */}
        <Section title="LINKS">
          <Field label="GitHub"><Input value={form.github} onChange={v => setForm({...form, github: v})} placeholder="github.com/username" /></Field>
          <Field label="LinkedIn"><Input value={form.linkedin} onChange={v => setForm({...form, linkedin: v})} placeholder="linkedin.com/in/username" /></Field>
          <Field label="Portfolio"><Input value={form.portfolio} onChange={v => setForm({...form, portfolio: v})} placeholder="yoursite.com" /></Field>
        </Section>

        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 rounded-xl font-display font-semibold text-sm transition-all"
          style={{ background: saving ? '#9BB82A' : '#C8F135', color: '#0D0D0F' }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#d4f547'; }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#C8F135'; }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save changes'}
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
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all"
      style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
      onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
      onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
    />
  );
}