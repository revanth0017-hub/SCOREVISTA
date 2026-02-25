'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  label: string;
  href: string;
}

interface TopNavProps {
  sportName?: string;
  items?: NavItem[];
}

const SPORT_NAV_ITEMS: Record<string, NavItem[]> = {
  cricket: [
    { label: 'Live Scores', href: '/sport/cricket/live' },
    { label: 'Schedule', href: '/sport/cricket/schedule' },
    { label: 'Teams', href: '/sport/cricket/teams' },
    { label: 'Players', href: '/sport/cricket/players' },
    { label: 'Highlights', href: '/sport/cricket/highlights' },
  ],
  football: [
    { label: 'Live Scores', href: '/sport/football/live' },
    { label: 'Fixtures', href: '/sport/football/fixtures' },
    { label: 'Teams', href: '/sport/football/teams' },
    { label: 'Standings', href: '/sport/football/standings' },
    { label: 'Highlights', href: '/sport/football/highlights' },
  ],
  volleyball: [
    { label: 'Live Scores', href: '/sport/volleyball/live' },
    { label: 'Schedule', href: '/sport/volleyball/schedule' },
    { label: 'Teams', href: '/sport/volleyball/teams' },
    { label: 'Rankings', href: '/sport/volleyball/rankings' },
    { label: 'Highlights', href: '/sport/volleyball/highlights' },
  ],
  basketball: [
    { label: 'Live Scores', href: '/sport/basketball/live' },
    { label: 'Schedule', href: '/sport/basketball/schedule' },
    { label: 'Teams', href: '/sport/basketball/teams' },
    { label: 'Standings', href: '/sport/basketball/standings' },
    { label: 'Highlights', href: '/sport/basketball/highlights' },
  ],
  kabaddi: [
    { label: 'Live Scores', href: '/sport/kabaddi/live' },
    { label: 'Schedule', href: '/sport/kabaddi/schedule' },
    { label: 'Teams', href: '/sport/kabaddi/teams' },
    { label: 'Rankings', href: '/sport/kabaddi/rankings' },
    { label: 'Highlights', href: '/sport/kabaddi/highlights' },
  ],
  shuttle: [
    { label: 'Live Scores', href: '/sport/shuttle/live' },
    { label: 'Schedule', href: '/sport/shuttle/schedule' },
    { label: 'Players', href: '/sport/shuttle/players' },
    { label: 'Rankings', href: '/sport/shuttle/rankings' },
    { label: 'Highlights', href: '/sport/shuttle/highlights' },
  ],
  tennis: [
    { label: 'Live Scores', href: '/sport/tennis/live' },
    { label: 'Schedule', href: '/sport/tennis/schedule' },
    { label: 'Players', href: '/sport/tennis/players' },
    { label: 'Rankings', href: '/sport/tennis/rankings' },
    { label: 'Highlights', href: '/sport/tennis/highlights' },
  ],
};

export function TopNav({ sportName = 'cricket', items }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = items || SPORT_NAV_ITEMS[sportName.toLowerCase()] || SPORT_NAV_ITEMS.cricket;

  const handleLogout = () => {
    // TODO: Clear auth state
    router.push('/login');
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40 text-card-foreground shadow-sm">
      <div className="ml-64 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-1 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 rounded-sm',
                    isActive
                      ? 'border-[var(--sport-primary)] text-[var(--sport-primary)]'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-[var(--sport-primary)]/30'
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2 ml-6">
            <ThemeToggle />
            <a
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-[var(--sport-primary-muted)] hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
