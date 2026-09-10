'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/lib/supabase/hooks';
import Link from 'next/link';
import { Bell, Check, Trash2, Users, Layers, Zap, Star, X } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    connection_request: { icon: Users, color: '#C8F135', bg: 'rgba(200,241,53,0.08)' },
    project_apply: { icon: Layers, color: '#C8F135', bg: 'rgba(200,241,53,0.08)' },
    mission_complete: { icon: Zap, color: '#9BB82A', bg: 'rgba(155,184,42,0.08)' },
    opportunity_match: { icon: Star, color: '#9BB82A', bg: 'rgba(155,184,42,0.08)' },
    default: { icon: Bell, color: '#7A7A8C', bg: 'rgba(42,42,48,0.5)' },
};

export default function NotificationsPage() {
    const { user } = useProfile();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetch = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);
            setNotifications(data || []);
            setLoading(false);
        };
        fetch();

        // Realtime
        const supabase = createClient();
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
            }, (payload: { new: any }) => {
                setNotifications(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    const markRead = async (id: string) => {
        const supabase = createClient();
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = async () => {
        if (!user) return;
        const supabase = createClient();
        await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotif = async (id: string) => {
        const supabase = createClient();
        await supabase.from('notifications').delete().eq('id', id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const timeAgo = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="min-h-screen" style={{ background: '#0D0D0F' }}>
            <header className="sticky top-0 z-20 border-b px-4 md:px-8 h-14 flex items-center justify-between"
                style={{ background: 'rgba(13,13,15,0.92)', backdropFilter: 'blur(12px)', borderColor: '#2A2A30' }}>
                <div className="flex items-center gap-3">
                    <h1 className="font-display font-bold text-base" style={{ color: '#E8E8F0' }}>Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(200,241,53,0.12)', color: '#C8F135', border: '1px solid rgba(200,241,53,0.2)' }}>
                            {unreadCount} new
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead}
                        className="flex items-center gap-1.5 font-mono text-xs h-8 px-3 rounded-lg transition-all"
                        style={{ background: '#141416', border: '1px solid #2A2A30', color: '#7A7A8C' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A30'; e.currentTarget.style.color = '#7A7A8C'; }}
                    >
                        <Check size={11} /> Mark all read
                    </button>
                )}
            </header>

            <main className="max-w-2xl mx-auto px-4 md:px-8 py-6">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-20 rounded-xl border animate-pulse" style={{ background: '#141416', borderColor: '#2A2A30' }} />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: '#141416', border: '1px solid #2A2A30' }}>
                            <Bell size={22} style={{ color: '#3A3A46' }} />
                        </div>
                        <p className="font-display text-base" style={{ color: '#3A3A46' }}>No notifications yet.</p>
                        <p className="font-body text-sm mt-1" style={{ color: '#3A3A46' }}>
                            When someone connects with you or applies to your project, you'll see it here.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {notifications.map((notif, i) => {
                            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default;
                            const Icon = config.icon;
                            return (
                                <div
                                    key={notif.id}
                                    className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 group"
                                    style={{
                                        background: notif.read ? '#141416' : '#1C1C20',
                                        borderColor: notif.read ? '#2A2A30' : 'rgba(200,241,53,0.15)',
                                        animation: `float-up 0.4s ease forwards`,
                                        animationDelay: `${i * 40}ms`,
                                        opacity: 0,
                                    }}
                                >
                                    {/* Icon */}
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: config.bg, border: `1px solid ${config.color}22` }}>
                                        <Icon size={15} style={{ color: config.color }} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {notif.link ? (
                                            <Link href={notif.link} onClick={() => markRead(notif.id)}>
                                                <p className="font-display font-medium text-sm mb-0.5" style={{ color: '#E8E8F0' }}>
                                                    {notif.title}
                                                    {!notif.read && (
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full ml-2 align-middle"
                                                            style={{ background: '#C8F135' }} />
                                                    )}
                                                </p>
                                                <p className="font-body text-xs" style={{ color: '#7A7A8C' }}>{notif.body}</p>
                                            </Link>
                                        ) : (
                                            <>
                                                <p className="font-display font-medium text-sm mb-0.5" style={{ color: '#E8E8F0' }}>
                                                    {notif.title}
                                                    {!notif.read && (
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full ml-2 align-middle"
                                                            style={{ background: '#C8F135' }} />
                                                    )}
                                                </p>
                                                <p className="font-body text-xs" style={{ color: '#7A7A8C' }}>{notif.body}</p>
                                            </>
                                        )}
                                        <span className="font-mono text-[10px] mt-1 block" style={{ color: '#3A3A46' }}>
                                            {timeAgo(notif.created_at)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.read && (
                                            <button onClick={() => markRead(notif.id)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                                style={{ background: '#1C1C20' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,241,53,0.1)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#1C1C20'; }}
                                                title="Mark as read"
                                            >
                                                <Check size={12} style={{ color: '#C8F135' }} />
                                            </button>
                                        )}
                                        <button onClick={() => deleteNotif(notif.id)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                            style={{ background: '#1C1C20' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.1)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#1C1C20'; }}
                                            title="Delete"
                                        >
                                            <X size={12} style={{ color: '#7A7A8C' }} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}