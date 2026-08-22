'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/landing/Navbar';
import Ticker from '@/components/landing/Ticker';
import ActivityCard from '@/components/ui/ActivityCard';
import { Activity, ACTIVITIES, STATS } from '@/lib/data';
import { fetchActivities } from '@/lib/actions/activities';
import { ArrowRight, Users, Layers, Map, Star } from 'lucide-react';

const ShapeGrid = dynamic(() => import('@/components/ui/ShapeGrid'), { ssr: false });
const StrokeText = dynamic(() => import('@/components/ui/StrokeText'), { ssr: false });

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="text-center transition-all duration-700" style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transitionDelay: `${delay}ms` }}>
      <div className="font-display font-bold text-4xl md:text-5xl" style={{ color: '#C8F135' }}>{value}</div>
      <div className="font-mono text-xs mt-1" style={{ color: '#7A7A8C' }}>{label}</div>
    </div>
  );
}

const FEATURES = [
  { icon: Layers, title: 'Build Together',      desc: 'Create a project, define roles, find teammates. Turn "I have an idea" into "we are shipping it."' },
  { icon: Star,   title: 'Skill Missions',       desc: 'Not just what to learn — what to actually build. Complete missions, earn XP, grow your reputation.' },
  { icon: Users,  title: 'Collaboration Match',  desc: "Find students who fit your project's needs. 91% match scores. No guessing." },
  { icon: Map,    title: 'Campus Network',        desc: 'See active builders, projects, and opportunities happening right at your college.' },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [strokeReady, setStrokeReady] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES.slice(0, 5));
  const feedRef = useInView(0.05);
  const featuresRef = useInView(0.1);

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 80);
    // Delay StrokeText slightly so fonts load
    const t2 = setTimeout(() => setStrokeReady(true), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    async function loadHeroFeed() {
      try {
        const live = await fetchActivities();
        if (live && live.length > 0) {
          setActivities(live.slice(0, 5));
        }
      } catch {
        // Fallback to static ACTIVITIES slice
      }
    }
    loadHeroFeed();
  }, []);

  return (
    <main className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* ShapeGrid — full hero background */}
        <div className="absolute inset-0 z-0">
          <ShapeGrid
            direction="diagonal"
            speed={0.35}
            squareSize={44}
            borderColor="rgba(42,42,48,0.7)"
            hoverFillColor="rgba(200,241,53,0.07)"
            hoverTrailAmount={5}
          />
        </div>

        {/* Top + bottom gradient fade so grid bleeds into page */}
        <div className="absolute inset-x-0 top-0 h-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #0D0D0F 0%, transparent 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-48 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0D0D0F 0%, transparent 100%)' }} />

        {/* Center volt glow */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div style={{
            width: '700px', height: '400px',
            background: 'radial-gradient(ellipse, rgba(200,241,53,0.06) 0%, transparent 65%)',
          }} />
        </div>

        {/* Hero content */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center pt-24">

          {/* Eyebrow pill */}
          <div
            className="inline-flex items-center gap-2 mb-10 px-3 py-1.5 rounded-full border font-mono text-xs transition-all duration-700"
            style={{
              borderColor: '#2A2A30',
              background: 'rgba(20,20,22,0.8)',
              backdropFilter: 'blur(8px)',
              color: '#7A7A8C',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
            }}
          >
            <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
            2,400+ students building right now
          </div>

          {/* StrokeText headline — line 1 */}
          <div
            className="transition-all duration-700 mb-1"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transitionDelay: '100ms' }}
          >
            <div className="font-display font-bold leading-none" style={{ fontSize: 'clamp(2.6rem, 7.5vw, 5.2rem)', color: '#E8E8F0' }}>
              See what students
            </div>
          </div>

          {/* StrokeText for "are building." — the animated word */}
          <div
            className="transition-all duration-700"
            style={{ opacity: strokeReady ? 1 : 0, transform: strokeReady ? 'translateY(0)' : 'translateY(20px)', transitionDelay: '200ms' }}
          >
            {strokeReady && (
              <StrokeText
                text="are building."
                strokeColor="#C8F135"
                fillColor="#E8E8F0"
                strokeWidth={1.2}
                drawDuration={2}
                fillDelay={0.15}
                stagger={0.05}
                ease="power3.out"
                trigger="mount"
                fillMode="wipe"
                fontSize={Math.min(72, typeof window !== 'undefined' ? window.innerWidth * 0.085 : 72)}
                fontWeight={700}
                letterSpacing={-3}
              />
            )}
          </div>

          {/* Subhead */}
          <p
            className="font-body text-lg md:text-xl max-w-xl mx-auto mt-6 mb-10 leading-relaxed transition-all duration-700"
            style={{ color: '#7A7A8C', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transitionDelay: '350ms' }}
          >
            Discover projects, find teammates, earn reputation.
            <br />
            The collaboration layer for Indian college students.
          </p>

          {/* CTAs */}
          <div
            className="flex items-center justify-center gap-4 flex-wrap transition-all duration-700"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transitionDelay: '450ms' }}
          >
            <Link
              href="/auth?mode=join"
              className="group flex items-center gap-2 font-display font-semibold text-base px-7 py-3.5 rounded-xl transition-all duration-200"
              style={{ background: '#C8F135', color: '#0D0D0F' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#d4f547'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 10px 28px rgba(200,241,53,0.28)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#C8F135'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >
              Start building
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/feed"
              className="font-body text-sm px-6 py-3.5 rounded-xl border transition-all duration-200"
              style={{ borderColor: 'rgba(42,42,48,0.9)', color: '#7A7A8C', background: 'rgba(20,20,22,0.6)', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#3A3A44'; el.style.color = '#E8E8F0'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(42,42,48,0.9)'; el.style.color = '#7A7A8C'; }}
            >
              Browse the feed
            </Link>
          </div>

          {/* Scroll hint */}
          <div
            className="mt-16 flex flex-col items-center gap-2 transition-all duration-700"
            style={{ opacity: mounted ? 0.4 : 0, transitionDelay: '700ms' }}
          >
            <div className="w-px h-10 animate-bounce" style={{ background: 'linear-gradient(to bottom, #C8F135, transparent)' }} />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── STATS ── */}
      <section className="py-16 px-6 border-b" style={{ borderColor: '#2A2A30' }}>
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => <StatCard key={s.label} value={s.value} label={s.label} delay={i * 80} />)}
        </div>
      </section>

      {/* ── LIVE FEED PREVIEW ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div ref={feedRef.ref} className="mb-8 transition-all duration-700" style={{ opacity: feedRef.inView ? 1 : 0, transform: feedRef.inView ? 'translateY(0)' : 'translateY(16px)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
              <span className="font-mono text-xs" style={{ color: '#C8F135' }}>LIVE ACTIVITY</span>
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl" style={{ color: '#E8E8F0' }}>
              What students are doing right now
            </h2>
            <p className="font-body text-sm mt-1" style={{ color: '#7A7A8C' }}>Real activity from builders across India</p>
          </div>

          <div className="flex flex-col gap-3 relative">
            {activities.map((activity, i) => (
              <div key={activity.id} className="transition-all duration-700" style={{ opacity: feedRef.inView ? 1 : 0, transform: feedRef.inView ? 'translateY(0)' : 'translateY(24px)', transitionDelay: `${i * 80}ms` }}>
                <ActivityCard activity={activity} blurred={i >= 3} />
              </div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-52 flex flex-col items-center justify-end pb-4"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, #0D0D0F 60%)' }}>
              <Link
                href="/auth?mode=join"
                className="font-display font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200"
                style={{ background: '#C8F135', color: '#0D0D0F' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d4f547'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,241,53,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C8F135'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Join to see the full feed →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 border-t" style={{ borderColor: '#2A2A30' }}>
        <div className="max-w-4xl mx-auto">
          <div ref={featuresRef.ref} className="mb-12 transition-all duration-700" style={{ opacity: featuresRef.inView ? 1 : 0, transform: featuresRef.inView ? 'translateY(0)' : 'translateY(16px)' }}>
            <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>WHAT YOU GET</span>
            <h2 className="font-display font-bold text-2xl md:text-3xl mt-2" style={{ color: '#E8E8F0' }}>Built for builders, not browsers.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-hover group p-6 rounded-xl border" style={{ background: '#141416', borderColor: '#2A2A30', opacity: featuresRef.inView ? 1 : 0, transform: featuresRef.inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s ease', transitionDelay: `${i * 80}ms` }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-105" style={{ background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.15)' }}>
                    <Icon size={16} style={{ color: '#C8F135' }} />
                  </div>
                  <h3 className="font-display font-semibold text-base mb-2" style={{ color: '#E8E8F0' }}>{f.title}</h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: '#7A7A8C' }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border font-mono text-xs" style={{ borderColor: '#2A2A30', background: '#141416', color: '#7A7A8C' }}>
            <span className="pulse-dot-slow w-1.5 h-1.5 rounded-full" style={{ background: '#9BB82A', display: 'inline-block' }} />
            Pre-launch · Join early
          </div>
          <h2 className="font-display font-bold mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#E8E8F0' }}>
            Your next project is<br />
            <span style={{ color: '#C8F135' }}>one connection away.</span>
          </h2>
          <p className="font-body text-base mb-8" style={{ color: '#7A7A8C' }}>Join the early builder community. Be the activity others see in the feed.</p>
          <Link
            href="/auth?mode=join"
            className="inline-flex items-center gap-2 font-display font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200"
            style={{ background: '#C8F135', color: '#0D0D0F' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#d4f547'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 12px 32px rgba(200,241,53,0.25)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#C8F135'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
          >
            Join Near Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: '#2A2A30' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="pulse-dot-slow w-1.5 h-1.5 rounded-full" style={{ background: '#C8F135', display: 'inline-block' }} />
            <span className="font-display font-semibold text-sm" style={{ color: '#3A3A46' }}>near<span style={{ color: '#7A7A8C' }}>now</span></span>
          </div>
          <span className="font-mono text-xs" style={{ color: '#3A3A46' }}>built by students, for students · India 🇮🇳</span>
        </div>
      </footer>
    </main>
  );
}
