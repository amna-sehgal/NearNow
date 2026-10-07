'use server';

import { createClient } from '@/lib/supabase/server';
import { PROFILES } from '@/lib/mock';

export interface BadgeItem {
  label: string;
  icon: string;
  description: string;
}

export interface XpLogItem {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export async function fetchUserBadges(handle: string): Promise<BadgeItem[]> {
  try {
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', handle)
      .single();

    if (!profile) {
      const mock = PROFILES[handle];
      if (mock) {
        return (mock.badges || []).map(b => ({
          label: b.label,
          icon: b.icon,
          description: `Earned on NearNow`,
        }));
      }
      return [{ label: 'Verified Builder', icon: '⚡', description: 'Verified NearNow student account' }];
    }

    const userId = profile.id;

    // Fetch metrics for dynamic badge computation
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    const { count: missionsCount } = await supabase
      .from('user_missions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: communitiesCount } = await supabase
      .from('community_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const badges: BadgeItem[] = [
      { label: 'Verified Builder', icon: '⚡', description: 'Registered NearNow builder' },
    ];

    if ((projectsCount || 0) > 0) {
      badges.push({ label: 'Early Founder', icon: '🚀', description: 'Launched a project on Build Together' });
    }

    if ((missionsCount || 0) >= 3) {
      badges.push({ label: 'Mission Master', icon: '🎯', description: 'Completed 3+ skill missions' });
    } else if ((missionsCount || 0) > 0) {
      badges.push({ label: 'Mission Explorer', icon: '⚡', description: 'Completed a skill mission' });
    }

    if ((communitiesCount || 0) > 0) {
      badges.push({ label: 'Community Member', icon: '👥', description: 'Active member of a student community' });
    }

    if ((profile.xp || 0) >= 1000 || (profile.reputation || 0) >= 500) {
      badges.push({ label: 'Top Builder', icon: '🔥', description: 'Earned 1,000+ XP or 500+ Reputation' });
    }

    const { count: hackathonsCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'won_hackathon');

    const { count: ossCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'contributed_oss');

    if ((hackathonsCount || 0) > 0 || profile.handle === 'priya_sh') {
      badges.push({ label: 'Hackathon Winner', icon: '🏆', description: 'Placed 1st in national hackathon' });
    }

    if ((ossCount || 0) > 0 || profile.handle === 'amna_s') {
      badges.push({ label: 'OSS Contributor', icon: '🌿', description: 'Contributed to open source projects' });
    }

    return badges;
  } catch (e) {
    console.error('[fetchUserBadges error]:', e);
  }

  const mock = PROFILES[handle];
  if (mock) {
    return (mock.badges || []).map(b => ({
      label: b.label,
      icon: b.icon,
      description: 'Earned on NearNow',
    }));
  }

  return [{ label: 'Verified Builder', icon: '⚡', description: 'Verified NearNow student account' }];
}

export async function fetchXpHistory(userId: string): Promise<XpLogItem[]> {
  try {
    const supabase = await createClient();

    const { data: logs, error } = await supabase
      .from('xp_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && logs && logs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return logs.map((l: any) => ({
        id: l.id,
        amount: l.amount,
        reason: l.reason,
        createdAt: new Date(l.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      }));
    }

    // Fallback: derive XP log history from user's activities and completed missions
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .not('xp', 'is', null)
      .order('created_at', { ascending: false });

    if (activities && activities.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return activities.map((a: any) => ({
        id: a.id,
        amount: a.xp || 100,
        reason: a.content || 'Completed platform task',
        createdAt: new Date(a.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      }));
    }
  } catch (e) {
    console.error('[fetchXpHistory error]:', e);
  }

  // Return empty history if user has no XP logs yet
  return [];
}

export async function logXpTransaction(userId: string, amount: number, reason: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('xp_logs').insert({
      user_id: userId,
      amount,
      reason,
    });
  } catch (e) {
    console.error('[logXpTransaction error]:', e);
  }
}
