'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Moon, Sun, LogOut, User, ChevronDown, CheckCheck, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authApi, notificationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const typeColor: Record<Notification['type'], string> = {
  info:    'bg-pink-400',
  warning: 'bg-yellow-400',
  success: 'bg-emerald-400',
  error:   'bg-rose-500',
  alert:   'bg-orange-400',
};

export default function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme, showNotifications, toggleNotifications, setShowNotifications } = useUIStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [notiLoading, setNotiLoading]       = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications, setShowNotifications]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (!showNotifications) return;
    setNotiLoading(true);
    notificationsApi
      .getNotifications()
      .then(({ data }) => setNotifications(data.data ?? []))
      .catch(() => toast.error('Could not load notifications'))
      .finally(() => setNotiLoading(false));
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error('Could not mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.allSettled(unread.map((n) => notificationsApi.markRead(n._id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearAuth();
    router.push('/login');
    toast.success('Logged out');
  };

  // Initials from name
  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-10">
      {/* Subtle glitter line at the very bottom of header */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Actions */}
      <div className="flex items-center gap-1.5 ml-auto">

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          {theme === 'dark'
            ? <Sun  className="w-4 h-4" />
            : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={toggleNotifications}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-pink-glow animate-glow-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-pink-glow z-50 flex flex-col max-h-[420px] overflow-hidden">
              {/* Glitter accent line */}
              <div className="h-0.5 bg-gradient-to-r from-primary via-glitter-gold to-accent flex-shrink-0" />

              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-primary hover:underline transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Panel body */}
              <div className="overflow-y-auto flex-1">
                {notiLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                    <Bell className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map((n) => (
                      <li
                        key={n._id}
                        className={cn(
                          'flex gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-primary/5 transition-colors',
                          !n.isRead && 'bg-primary/5'
                        )}
                        onClick={() => {
                          if (!n.isRead) handleMarkRead(n._id);
                          if (n.link) router.push(n.link);
                        }}
                      >
                        {/* Type dot */}
                        <span className={cn('mt-1.5 w-2 h-2 rounded-full flex-shrink-0', typeColor[n.type])} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm leading-snug', !n.isRead && 'font-medium')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1">
                            {formatRelativeTime(new Date(n.createdAt))}
                          </p>
                        </div>
                        {!n.isRead && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-glow-pulse" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors group"
          >
            {/* Avatar with pink ring */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-2 ring-primary/40 ring-offset-1 ring-offset-background shadow-pink-glow">
              <span className="text-xs font-bold text-white">
                {initials ?? <User className="w-3.5 h-3.5" />}
              </span>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-pink-glow z-20 overflow-hidden">
                {/* Glitter accent line */}
                <div className="h-0.5 bg-gradient-to-r from-primary via-glitter-gold to-accent" />

                <div className="p-3 border-b border-border">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { router.push('/dashboard/settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
