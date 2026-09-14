'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'join' ? 'join' : 'signin';
  const [mode, setMode] = useState<'signin' | 'join'>(defaultMode);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', college: '', handle: '', password: '',
  });

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    const supabase = createClient();

    if (mode === 'join') {
      // Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (signUpError) { setError(signUpError.message); setLoading(false); return; }

      if (data.user) {
        // Create profile
        const handle = form.handle || form.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase();
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          name: form.name,
          handle,
          avatar: form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
          college: form.college,
        });
        if (profileError) { setError(profileError.message); setLoading(false); return; }

        // Insert welcome activity
        await supabase.from('activities').insert({
          user_id: data.user.id,
          type: 'joined_platform',
          content: 'joined Near Now',
          tags: [],
        });
      }
      router.push('/feed');
    } else {
      // Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
      router.push('/feed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D0D0F' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(42,42,48,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,48,0.25) 1px, transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)' }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(200,241,53,0.06) 0%, transparent 70%)' }} />

      <header className="relative px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
          <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>near<span style={{ color: '#C8F135' }}>now</span></span>
        </Link>
        <div className="w-16" />
      </header>

      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Toggle */}
          <div className="flex p-1 rounded-xl mb-8" style={{ background: '#141416', border: '1px solid #2A2A30' }}>
            {(['signin', 'join'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className="flex-1 h-9 rounded-lg font-display font-medium text-sm transition-all duration-200"
                style={{ background: mode === m ? '#1C1C20' : 'transparent', color: mode === m ? '#E8E8F0' : '#7A7A8C', border: mode === m ? '1px solid #2A2A30' : '1px solid transparent' }}
              >
                {m === 'signin' ? 'Sign in' : 'Join'}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#E8E8F0' }}>
              {mode === 'join' ? 'Start building.' : 'Welcome back.'}
            </h1>
            <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>
              {mode === 'join' ? 'Join the builder community. Show your work.' : 'Jump back into your feed.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl font-body text-sm" style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          {/* GitHub OAuth */}
          <button
            type="button"
            onClick={async () => {
              try {
                setError('');
                const supabase = createClient();
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: 'github',
                  options: { redirectTo: `${window.location.origin}/feed` },
                });
                if (error) {
                  setError(error.message);
                  console.error('[GitHub OAuth Error]:', error);
                } else if (data?.url) {
                  window.location.href = data.url;
                }
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Failed to initiate GitHub login.';
                setError(msg);
                console.error('[GitHub OAuth Exception]:', err);
              }
            }}
            className="w-full h-10 flex items-center justify-center gap-2.5 rounded-xl font-body text-sm mb-5 transition-all duration-200"
            style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A3A44'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; }}
          >
            <span style={{ color: '#C8F135' }}><GithubIcon /></span>
            Continue with GitHub
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: '#2A2A30' }} />
            <span className="font-mono text-xs" style={{ color: '#3A3A46' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#2A2A30' }} />
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-3 mb-5">
            {mode === 'join' && (
              <>
                <Field label="Full name">
                  <Input type="text" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Amna Sehgal" />
                </Field>
                <Field label="Username">
                  <Input type="text" value={form.handle} onChange={v => setForm({ ...form, handle: v.toLowerCase().replace(/\s/g, '_') })} placeholder="amna_s" />
                </Field>
                <Field label="College">
                  <Input type="text" value={form.college} onChange={v => setForm({ ...form, college: v })} placeholder="IGDTUW, DTU, NSUT..." />
                </Field>
              </>
            )}
            <Field label="Email">
              <Input type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="you@college.edu" />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="········" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#3A3A46' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full h-11 rounded-xl font-display font-semibold text-sm transition-all duration-200 mb-4"
            style={{ background: loading ? '#9BB82A' : '#C8F135', color: '#0D0D0F' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d4f547'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#C8F135'; }}
          >
            {loading ? 'Please wait...' : mode === 'join' ? 'Create account' : 'Sign in'}
          </button>

          <p className="text-center font-body text-xs" style={{ color: '#3A3A46' }}>
            {mode === 'signin' ? "No account? " : "Already building? "}
            <button onClick={() => { setMode(mode === 'signin' ? 'join' : 'signin'); setError(''); }}
              style={{ color: '#7A7A8C' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#C8F135'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
            >
              {mode === 'signin' ? 'Join Near Now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
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

function Input({ type, value, onChange, placeholder }: { type: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all"
      style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
      onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
      onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>;
}