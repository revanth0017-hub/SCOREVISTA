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
  { id: 1, team1: 'Waves', team2: 'Thunder', date: '2024-02-15', time: '6:00 PM', status: 'upcoming', venue: 'Central Court' },
  { id: 2, team1: 'Eagles', team2: 'Titans', date: '2024-02-10', time: '5:00 PM', status: 'completed', venue: 'Main Hall' },
  { id: 3, team1: 'Fire', team2: 'Storm', date: '2024-02-18', time: '7:00 PM', status: 'upcoming', venue: 'Central Court' },
];

export default function VolleyballMatchesPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'volleyball';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageMatches sport={sport} sportIcon={sportIcon} initialMatches={INITIAL} />
      </div>
    </AdminShell>
  );
}
