'use client';
import { useEffect, useState } from 'react';
import { createClient } from './client';
import type { User } from '@supabase/supabase-js';

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
  created_at: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useProfile() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) { setLoading(false); return; }
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [user, userLoading]);

  return { profile, user, loading };
}