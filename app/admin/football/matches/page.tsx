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

const FOOTBALL_MATCHES: MatchRow[] = [
  { id: 1, team1: 'Manchester United', team2: 'Liverpool', date: '2024-02-15', time: '3:00 PM', status: 'upcoming', venue: 'Old Trafford' },
  { id: 2, team1: 'Arsenal', team2: 'Chelsea', date: '2024-02-10', time: '2:00 PM', status: 'completed', venue: 'Emirates Stadium' },
  { id: 3, team1: 'Barcelona', team2: 'Real Madrid', date: '2024-02-18', time: '8:00 PM', status: 'upcoming', venue: 'Camp Nou' },
];

export default function FootballMatchesPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'football';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageMatches sport={sport} sportIcon={sportIcon} initialMatches={FOOTBALL_MATCHES} />
      </div>
    </AdminShell>
  );
}
