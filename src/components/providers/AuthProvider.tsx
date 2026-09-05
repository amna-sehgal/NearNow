// src/components/providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/actions/auth';

export interface AuthUser {
  id: string;
  email?: string;
  name: string;
  handle: string;
  avatar: string;
  college?: string;
  xp: number;
  xpToNext: number;
  reputation: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  signOut: async () => {},
});

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const current = await getCurrentUser();
      if (current?.profile) {
        setUser({
          id: current.id,
          name: current.profile.name,
          handle: current.profile.handle,
          avatar: current.profile.avatar || 'SB',
          college: current.profile.college,
          xp: current.profile.xp ?? 0,
          xpToNext: current.profile.xpToNext ?? 1000,
          reputation: current.profile.reputation ?? 100,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If initialUser was not provided on SSR, attempt client fetch once
    if (!initialUser) {
      refreshUser();
    } else {
      setLoading(false);
    }

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          await refreshUser();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      router.push('/auth');
      router.refresh();
    } catch (err) {
      console.error('[AuthProvider SignOut Error]:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
