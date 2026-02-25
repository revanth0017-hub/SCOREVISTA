'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminManageMatches, type MatchRow } from '@/components/admin-manage-matches';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

const INITIAL: MatchRow[] = [
  { id: 1, team1: 'Team A', team2: 'Team B', date: '2024-02-15', time: '7:00 PM', status: 'upcoming', venue: 'Main Arena' },
  { id: 2, team1: 'Team C', team2: 'Team D', date: '2024-02-10', time: '6:00 PM', status: 'completed', venue: 'Secondary Arena' },
];

export default function BasketballMatchesPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'basketball';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageMatches sport={sport} sportIcon={sportIcon} initialMatches={INITIAL} />
      </div>
    </AdminShell>
  );
}
