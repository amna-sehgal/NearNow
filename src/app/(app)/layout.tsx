import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { AuthProvider, AuthUser } from '@/components/providers/AuthProvider';
import { getCurrentUser } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentUser();
  const initialUser: AuthUser | null = current?.profile
    ? {
        id: current.id,
        name: current.profile.name,
        handle: current.profile.handle,
        avatar: current.profile.avatar || 'SB',
        college: current.profile.college,
        xp: current.profile.xp ?? 0,
        xpToNext: current.profile.xpToNext ?? 1000,
        reputation: current.profile.reputation ?? 100,
      }
    : null;

  return (
    <AuthProvider initialUser={initialUser}>
      <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
        <Sidebar />
        {/* Offset for sidebar on desktop */}
        <div className="md:ml-60 pb-16 md:pb-0 min-h-screen">
          {children}
        </div>
        <MobileNav />
      </div>
    </AuthProvider>
  );
}