'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Users,
  TrendingUp,
  MessageCircle,
  Brain,
  BarChart2,
  Bell,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: '/dashboard' },
  { icon: Newspaper,       label: 'News Feed',   href: '/dashboard/news' },
  { icon: Users,           label: 'Competitors', href: '/dashboard/competitors' },
  { icon: TrendingUp,      label: 'Trends',      href: '/dashboard/trends' },
  { icon: MessageCircle,   label: 'Sentiment',   href: '/dashboard/sentiment' },
  { icon: Brain,           label: 'AI Agents',   href: '/dashboard/agents' },
  { icon: BarChart2,       label: 'Analytics',   href: '/dashboard/analytics' },
  { icon: Bell,            label: 'Alerts',      href: '/dashboard/alerts' },
  { icon: Star,            label: 'Watchlists',  href: '/dashboard/watchlists' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border transition-all duration-300 ease-in-out',
        'bg-card',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      {/* Subtle glitter background texture */}
      <div className="absolute inset-0 sparkle-bg opacity-40 pointer-events-none" />

      {/* Logo */}
      <div
        className={cn(
          'relative flex items-center h-16 px-4 border-b border-border gap-3',
          !sidebarOpen && 'justify-center'
        )}
      >
        {/* Glittery logo badge */}
        <div className="glitter relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-pink-glow animate-glow-pulse flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]" />
          {/* Sparkle dots */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-glitter-gold animate-sparkle" />
          <span className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 rounded-full bg-glitter-blush animate-sparkle-delayed" />
        </div>

        {sidebarOpen && (
          <div>
            <p className="shimmer-text font-bold text-sm leading-tight">MarketIntel</p>
            <p className="text-xs text-muted-foreground tracking-wide">AI Platform ✦</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="relative flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'nav-active-glow text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:shadow-inner-pink',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      'flex-shrink-0 transition-all duration-200',
                      isActive
                        ? 'w-5 h-5 drop-shadow-[0_0_6px_hsl(330_80%_65%_/_0.8)]'
                        : 'w-4 h-4'
                    )}
                  />
                  {sidebarOpen && (
                    <span className={cn(isActive && 'font-semibold')}>
                      {item.label}
                    </span>
                  )}
                  {/* Active indicator bar */}
                  {isActive && sidebarOpen && (
                    <span className="ml-auto w-1.5 h-4 rounded-full bg-primary shadow-pink-glow animate-glow-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings & collapse */}
      <div className="relative py-4 border-t border-border px-2 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200',
            !sidebarOpen && 'justify-center px-2'
          )}
          title={!sidebarOpen ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>Settings</span>}
        </Link>

        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200',
            !sidebarOpen && 'justify-center px-2'
          )}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
