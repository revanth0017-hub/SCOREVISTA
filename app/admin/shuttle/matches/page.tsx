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
  { id: 1, team1: 'Rackets United', team2: 'Shuttlecock Kings', date: '2024-02-10', time: '4:00 PM', status: 'completed', venue: 'Badminton Court' },
];

export default function ShuttleMatchesPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'shuttle';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageMatches sport={sport} sportIcon={sportIcon} initialMatches={INITIAL} />
      </div>
    </AdminShell>
  );
}
