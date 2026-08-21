'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(13,13,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(42,42,48,0.8)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-2 h-2 rounded-full pulse-dot"
            style={{ background: '#C8F135' }}
          />
          <span className="font-display font-semibold text-[#E8E8F0] text-lg tracking-tight group-hover:text-white transition-colors">
            near<span style={{ color: '#C8F135' }}>now</span>
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="font-body text-sm text-[#7A7A8C] hover:text-[#E8E8F0] transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/auth?mode=join"
            className="font-display text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              background: '#C8F135',
              color: '#0D0D0F',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.background = '#d4f547';
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.background = '#C8F135';
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Join →
          </Link>
        </div>
      </div>
    </nav>
  );
}
