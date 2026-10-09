'use client';
import { useEffect, useState } from 'react';
import { createClient } from './client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useProfileContext } from '@/components/layout/ProfileProvider';

export interface Profile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  college: string;
  year: string;
  location: string;
  bio: string;
  reputation: number;
  xp: number;
  xp_to_next: number;
  skills: string[];
  looking_for: string[];
  github: string;
  linkedin: string;
  portfolio: string;
}

export function useUser() {
  const profileCtx = useProfileContext();
  const [user, setUser] = useState<User | null>(profileCtx?.user ?? null);
  const [loading, setLoading] = useState(profileCtx ? false : true);

  useEffect(() => {
    if (profileCtx) return;

    const supabase = createClient();

    supabase.auth.getSession().then((result: { data: { session: Session | null } }) => {
      setUser(result.data.session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, [profileCtx]);

  if (profileCtx) {
    return { user: profileCtx.user, loading: false };
  }

  return { user, loading };
}

export function useProfile() {
  const profileCtx = useProfileContext();
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(profileCtx?.profile ?? null);

  useEffect(() => {
    if (profileCtx) return;
    if (userLoading || !user) return;

    let isMounted = true;
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then((result: { data: Profile | null }) => {
        if (isMounted) {
          setProfile(result.data);
        }
      });
    return () => { isMounted = false; };
  }, [profileCtx, user, userLoading]);

  if (profileCtx) {
    return { profile: profileCtx.profile, user: profileCtx.user, loading: false };
  }

  const effectiveLoading = userLoading || (!!user && profile === null);
  return { profile, user, loading: effectiveLoading };
}