'use client';

import { ReactNode } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

import {
  SidebarInset,
} from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Try to get sport from query params first (for /admin/dashboard?sport=football)
  // Otherwise extract from pathname (for /admin/football/matches)
  const sportFromQuery = searchParams.get('sport');
  const sportFromPath = pathname.split('/')[2]; // /admin/football/matches -> football
  
  const sport = (sportFromQuery || sportFromPath || 'cricket').toLowerCase();
  const sportEmoji = SPORT_EMOJI[sport] || '🏆';

  return (
    <>
      <AdminSidebar sport={sport} sportIcon={sportEmoji} />
      <SidebarInset className="min-h-svh">
        {children}
      </SidebarInset>
    </>
  );
}

