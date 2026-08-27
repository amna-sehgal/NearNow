// src/app/(app)/layout.tsx
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
      <Sidebar />
      {/* Offset for sidebar on desktop */}
      <div className="md:ml-60 pb-16 md:pb-0 min-h-screen">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}