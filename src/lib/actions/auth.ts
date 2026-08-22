'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface AuthState {
  error?: string;
  success?: boolean;
  needsEmailConfirmation?: boolean;
}

export async function signUpUser(formData: {
  name: string;
  email: string;
  college: string;
  password: string;
}): Promise<AuthState> {
  const { name, email, college, password } = formData;

  if (!email || !password || !name || !college) {
    return { error: 'Please fill in all required fields.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          college,
        },
      },
    });

    if (error) {
      console.error('[Supabase Auth signUp error]:', error);
      return { error: error.message };
    }

    if (data?.user) {
      const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      const nameParts = name.trim().split(' ');
      const avatar = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        handle,
        avatar,
        college,
      });

      if (profileError) {
        console.error('[Supabase Profile Upsert error]:', profileError);
      }

      // Attempt automatic login to establish session cookie immediately
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.session) {
        // If email confirmation is enabled in Supabase settings
        return {
          success: true,
          needsEmailConfirmation: true,
        };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('=============================================');
    console.error('[signUpUser Exception]:', err);
    if (err.cause) {
      console.error('[signUpUser Error Cause]:', err.cause);
    }
    console.error('=============================================');

    return {
      error: err?.message || 'Unable to connect to authentication server. Please check your Supabase URL & Anon Key.',
    };
  }
}

export async function signInUser(formData: {
  email: string;
  password: string;
}): Promise<AuthState> {
  const { email, password } = formData;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Supabase Auth signIn error]:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('=============================================');
    console.error('[signInUser Exception]:', err);
    if (err.cause) {
      console.error('[signInUser Error Cause]:', err.cause);
    }
    console.error('=============================================');

    return {
      error: err?.message || 'Unable to connect to authentication server. Please check your Supabase URL & Anon Key.',
    };
  }
}

export async function signOutUser() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[signOutUser Error]:', err);
  }
  redirect('/auth');
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      profile: profile || {
        name: user.user_metadata?.name || 'Builder',
        handle: user.email?.split('@')[0] || 'builder',
        avatar: 'SB',
        college: user.user_metadata?.college || 'NearNow Member',
      },
    };
  } catch (err) {
    console.error('[getCurrentUser Error]:', err);
    return null;
  }
}
