'use client';

import { getSportTheme } from '@/lib/sport-theme';

interface SportPageHeaderProps {
  sportName: string;
  title?: string;
  description?: string;
}

export function SportPageHeader({
  sportName,
  title,
  description = 'Follow live scores and match updates',
}: SportPageHeaderProps) {
  const theme = getSportTheme(sportName);
  const displayTitle = title ?? theme.name;

  return (
    <div className="border-b border-border px-8 py-6 bg-[var(--sport-primary-muted-bg)]">
      <div className="flex items-center gap-4 max-w-7xl mx-auto">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[var(--sport-primary-muted)]">
          <span className="text-3xl">{theme.icon}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{displayTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
