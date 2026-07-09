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
  FileText,
  Search,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Newspaper, label: 'News Feed', href: '/dashboard/news' },
  { icon: Users, label: 'Competitors', href: '/dashboard/competitors' },
  { icon: TrendingUp, label: 'Trends', href: '/dashboard/trends' },
  { icon: MessageCircle, label: 'Sentiment', href: '/dashboard/sentiment' },
  { icon: Brain, label: 'AI Agents', href: '/dashboard/agents' },
  { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
  { icon: Search, label: 'Search', href: '/dashboard/search' },
  { icon: Star, label: 'Watchlists', href: '/dashboard/watchlists' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-border gap-3', !sidebarOpen && 'justify-center')}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <p className="font-bold text-sm leading-tight">MarketIntel</p>
            <p className="text-xs text-muted-foreground">AI Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className={cn('flex-shrink-0', isActive ? 'w-5 h-5' : 'w-4 h-4')} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings & collapse */}
      <div className="py-4 border-t border-border px-2 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors',
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
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors',
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
