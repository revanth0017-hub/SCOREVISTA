'use client';

import React, { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getAdminSport } from '@/lib/admin-sport';
import type { SportId } from '@/lib/sport-theme';

/**
 * Sets data-sport on wrapper so CSS variables apply.
 * User routes: /sport/[sport]/... → sport from path.
 * Admin routes: ?sport= in URL first, else sessionStorage (set on login / navigation), else cricket.
 * Other: "all" for neutral theme.
 */
export function SportThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div data-sport="all" suppressHydrationWarning className="min-h-screen transition-colors duration-300">
          {children}
        </div>
      }
    >
      <SportThemeInner>{children}</SportThemeInner>
    </Suspense>
  );
}

function SportThemeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sport, setSport] = React.useState<SportId | 'all'>('all');

  React.useEffect(() => {
    setSport(resolveSport(pathname, searchParams));
  }, [pathname, searchParams]);

  return (
    <div data-sport={sport} suppressHydrationWarning className="min-h-screen transition-colors duration-300">
      {children}
    </div>
  );
}

function resolveSport(pathname: string, searchParams: URLSearchParams): SportId | 'all' {
  const allowed: SportId[] = [
    'cricket',
    'basketball',
    'tennis',
    'shuttle',
    'football',
    'kabaddi',
    'volleyball',
  ];
  if (pathname.startsWith('/sport/')) {
    const segment = pathname.split('/')[2];
    if (segment && allowed.includes(segment as SportId)) return segment as SportId;
  }
  if (pathname.startsWith('/admin')) {
    const q = searchParams.get('sport')?.toLowerCase();
    if (q && allowed.includes(q as SportId)) return q as SportId;
    const stored = getAdminSport()?.toLowerCase();
    if (stored && allowed.includes(stored as SportId)) return stored as SportId;
    return 'cricket';
  }
  return 'all';
}
