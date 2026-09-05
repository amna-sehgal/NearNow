import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <Sidebar userId={user.id} />
      <div className="md:ml-60 pb-16 md:pb-0 min-h-screen">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}