'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { getAdminSport } from '@/lib/admin-sport';
import type { SportId } from '@/lib/sport-theme';

/**
 * Sets data-sport on wrapper so CSS variables apply.
 * User routes: /sport/[sport]/... → sport from path.
 * Admin routes: sport from sessionStorage (set on login) or default cricket.
 * Other: "all" for neutral theme.
 */
export function SportThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // we deliberately compute sport on the client only to avoid mismatches
  // during SSR (server doesn't know admin sport). start with a neutral value
  // and update once the pathname / storage is available.
  const [sport, setSport] = React.useState<SportId | 'all'>('all');

  React.useEffect(() => {
    setSport(resolveSport(pathname));
  }, [pathname]);

  return (
    <div
      data-sport={sport}
      suppressHydrationWarning
      className="min-h-screen transition-colors duration-300">
      {children}
    </div>
  );
}

function resolveSport(pathname: string): SportId {
  if (pathname.startsWith('/sport/')) {
    const segment = pathname.split('/')[2];
    const allowed: SportId[] = ['cricket', 'basketball', 'tennis', 'shuttle', 'football', 'kabaddi', 'volleyball'];
    if (segment && allowed.includes(segment as SportId)) return segment as SportId;
  }
  if (pathname.startsWith('/admin')) {
    const stored = getAdminSport()?.toLowerCase();
    const allowed: SportId[] = ['cricket', 'basketball', 'tennis', 'shuttle', 'football', 'kabaddi', 'volleyball'];
    if (stored && allowed.includes(stored as SportId)) return stored as SportId;
    return 'cricket';
  }
  return 'all';
}
