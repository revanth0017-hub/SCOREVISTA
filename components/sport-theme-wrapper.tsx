'use client';

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
  const sport = resolveSport(pathname);

  return (
    <div data-sport={sport} className="min-h-screen transition-colors duration-300">
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
