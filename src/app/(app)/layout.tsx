import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { ProfileProvider } from '@/components/layout/ProfileProvider';
import type { Profile } from '@/lib/supabase/hooks';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <ProfileProvider initialProfile={profile as Profile | null} initialUser={user}>
      <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
        <Sidebar userId={user.id} />
        <div className="md:ml-60 pb-16 md:pb-0 min-h-screen">
          {children}
        </div>
        <MobileNav />
      </div>
    </ProfileProvider>
  );
}