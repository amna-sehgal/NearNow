'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function AuthForm() {
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'join' ? 'join' : 'signin';
  const [mode, setMode] = useState<'signin' | 'join'>(defaultMode);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', college: '', password: '' });

  const fields = mode === 'join'
    ? [
        { key: 'name',     label: 'Full name',          placeholder: 'Amna Sehgal',       type: 'text'     },
        { key: 'email',    label: 'College email',       placeholder: 'you@college.edu',   type: 'email'    },
        { key: 'college',  label: 'College',             placeholder: 'IGDTUW, DTU, NSUT…',type: 'text'     },
        { key: 'password', label: 'Password',            placeholder: '········',          type: 'password' },
      ]
    : [
        { key: 'email',    label: 'Email',               placeholder: 'you@college.edu',   type: 'email'    },
        { key: 'password', label: 'Password',            placeholder: '········',          type: 'password' },
      ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D0D0F' }}>
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(42,42,48,0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(42,42,48,0.25) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
        }}
      />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '500px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(200,241,53,0.06) 0%, transparent 70%)',
        }}
      />

      <header className="relative px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-body text-sm transition-colors" style={{ color: '#7A7A8C' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
          <span className="font-display font-semibold text-sm" style={{ color: '#E8E8F0' }}>
            near<span style={{ color: '#C8F135' }}>now</span>
          </span>
        </Link>
        <div className="w-16" />
      </header>

      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Toggle */}
          <div
            className="flex p-1 rounded-xl mb-8"
            style={{ background: '#141416', border: '1px solid #2A2A30' }}
          >
            {(['signin', 'join'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 h-9 rounded-lg font-display font-medium text-sm transition-all duration-200"
                style={{
                  background: mode === m ? '#1C1C20' : 'transparent',
                  color: mode === m ? '#E8E8F0' : '#7A7A8C',
                  border: mode === m ? '1px solid #2A2A30' : '1px solid transparent',
                }}
              >
                {m === 'signin' ? 'Sign in' : 'Join'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#E8E8F0' }}>
              {mode === 'join' ? 'Start building.' : 'Welcome back.'}
            </h1>
            <p className="font-body text-sm" style={{ color: '#7A7A8C' }}>
              {mode === 'join'
                ? 'Join the builder community. Show your work.'
                : 'Jump back into your feed.'}
            </p>
          </div>

          {/* GitHub OAuth */}
          <button
            className="w-full h-10 flex items-center justify-center gap-2.5 rounded-xl font-body text-sm mb-5 transition-all duration-200"
            style={{ background: '#1C1C20', border: '1px solid #2A2A30', color: '#E8E8F0' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A3A44'; e.currentTarget.style.background = '#222226'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.background = '#1C1C20'; }}
          >
            <span style={{ color: '#C8F135' }}><GithubIcon /></span>
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: '#2A2A30' }} />
            <span className="font-mono text-xs" style={{ color: '#3A3A46' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#2A2A30' }} />
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-3 mb-5">
            {fields.map(field => (
              <div key={field.key}>
                <label className="font-mono text-[11px] mb-1.5 block" style={{ color: '#7A7A8C' }}>
                  {field.label.toUpperCase()}
                </label>
                <div className="relative">
                  <input
                    type={field.key === 'password' && showPass ? 'text' : field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all duration-200"
                    style={{ background: '#141416', border: '1px solid #2A2A30', color: '#E8E8F0' }}
                    onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
                    onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
                  />
                  {field.key === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#3A3A46' }}
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            className="w-full h-11 rounded-xl font-display font-semibold text-sm transition-all duration-200 mb-4"
            style={{ background: '#C8F135', color: '#0D0D0F' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,241,53,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {mode === 'join' ? 'Create account' : 'Sign in'}
          </button>

          {mode === 'signin' && (
            <p className="text-center font-body text-xs" style={{ color: '#3A3A46' }}>
              No account?{' '}
              <button
                onClick={() => setMode('join')}
                style={{ color: '#7A7A8C' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
              >
                Join Near Now
              </button>
            </p>
          )}
          {mode === 'join' && (
            <p className="text-center font-body text-xs" style={{ color: '#3A3A46' }}>
              Already building?{' '}
              <button
                onClick={() => setMode('signin')}
                style={{ color: '#7A7A8C' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C8F135'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
