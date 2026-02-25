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
  { id: 1, team1: 'Dragons', team2: 'Tigers', date: '2024-02-15', time: '7:00 PM', status: 'live', venue: 'Kabaddi Arena' },
];

export default function KabaddiMatchesPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'kabaddi';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageMatches sport={sport} sportIcon={sportIcon} initialMatches={INITIAL} />
      </div>
    </AdminShell>
  );
}
