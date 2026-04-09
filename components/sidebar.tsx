'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Zap, Medal, TrendingUp, Flame, Brain, User, LogOut, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearToken } from '@/lib/api';
import { ThemeToggle } from '@/components/theme-toggle';

const SIDEBAR_ITEMS = [
  { label: 'Home', icon: Home, href: '/dashboard' },
  { label: 'Sports', icon: Medal, href: '/sports' },
  { label: 'Live Matches', icon: Zap, href: '/matches' },
  { label: 'Results', icon: TrendingUp, href: '/results' },
  { label: 'Highlights', icon: Flame, href: '/highlights' },
  { label: 'Quiz', icon: Brain, href: '/quiz' },
  { label: 'Profile', icon: User, href: '/profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen fixed left-0 top-0 flex flex-col shadow-lg">
      {/* Logo */}
      <Link href="/dashboard" className="block p-6 border-b border-sidebar-border hover:opacity-80 transition">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ScoreVista</h1>
            <p className="text-xs text-sidebar-accent">Live Scores</p>
          </div>
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/20 hover:translate-x-1'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme + Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2 px-2">
          <ThemeToggle className="ml-auto" />
          <span className="text-xs text-sidebar-accent">Theme</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
