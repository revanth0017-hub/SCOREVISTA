'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Settings,
  Users,
  Target,
  LogOut,
  Trophy,
  MessageSquare,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { AdminSidebarProps } from '@/types';
import { setAdminSport, clearAdminSport } from '@/lib/admin-sport';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';

const ADMIN_SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: Home, segment: 'dashboard' },
  { label: 'Assistant', icon: MessageSquare, segment: 'assistant' },
  { label: 'Manage Matches', icon: Target, segment: 'matches' },
  { label: 'Manage Teams', icon: Users, segment: 'teams' },
  { label: 'Settings', icon: Settings, segment: 'settings' },
];

export function AdminSidebar({ sport, sportIcon = '🏆' }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setAdminSport(sport);
  }, [sport]);

  const handleLogout = () => {
    clearAdminSport();
    router.push('/');
  };

  const isSegmentActive = (segment: string) => {
    if (segment === 'dashboard') {
      return pathname.startsWith('/admin/dashboard');
    }
    if (segment === 'assistant') {
      return pathname.startsWith('/admin/assistant');
    }

    return pathname.startsWith(`/admin/${sport}/${segment}`);
  };

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
      className="border-r border-sidebar-border"
    >
      <SidebarHeader className="border-b border-sidebar-border pb-4">
        <Link
          href={`/admin/dashboard?sport=${sport}`}
          className="flex items-center gap-3 px-2 pt-2"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--sport-primary)]">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-none">
              ScoreVista
            </span>
            <span className="text-xs text-muted-foreground font-medium mt-1">
              Admin Panel
            </span>
          </div>
        </Link>

        <div className="mt-4 mx-1 rounded-lg border border-sidebar-border px-3 py-2 bg-[var(--sport-primary-muted)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">{sportIcon}</span>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Managing
              </span>
              <span className="text-base font-bold text-[var(--sport-primary)] capitalize">
                {sport}
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <nav className="space-y-1">
          {ADMIN_SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            let href = '';
            if (item.segment === 'dashboard') {
              href = `/admin/dashboard?sport=${sport}`;
            } else if (item.segment === 'assistant') {
              href = `/admin/assistant?sport=${sport}`;
            } else {
              href = `/admin/${sport}/${item.segment}`;
            }

            const active = isSegmentActive(item.segment);

            return (
              <Link
                key={item.segment}
                href={href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  'text-sidebar-foreground hover:bg-[var(--sport-primary-muted)] hover:text-white',
                  active &&
                    'bg-[var(--sport-primary)] text-white hover:bg-[var(--sport-primary)] hover:opacity-95'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                <span
                  className={cn(
                    'ml-auto h-1.5 w-1.5 rounded-full bg-transparent transition-transform duration-150',
                    active && 'bg-white scale-110'
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border mt-auto pt-3 pb-4 px-2 space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-muted-foreground font-medium">Theme</span>
          <ThemeToggle className="text-sidebar-foreground" />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-[var(--sport-primary-muted)] hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
