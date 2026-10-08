'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/supabase/hooks';
import { createClient } from '@/lib/supabase/client';

export interface ProfileContextValue {
  profile: Profile | null;
  user: User | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  children,
  initialProfile,
  initialUser,
}: {
  children: React.ReactNode;
  initialProfile: Profile | null;
  initialUser: User | null;
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [user] = useState<User | null>(initialUser);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) {
      setProfile(data as Profile);
    }
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        user,
        loading: false,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  return useContext(ProfileContext);
}
