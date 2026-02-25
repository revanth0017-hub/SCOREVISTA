'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminManageTeams, type TeamRow } from '@/components/admin-manage-teams';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

const INITIAL: TeamRow[] = [
  { id: 1, name: 'Ace Players', players: 6, wins: 6, losses: 0, captain: '' },
  { id: 2, name: 'Serve Masters', players: 6, wins: 4, losses: 2, captain: '' },
];

export default function TennisTeamsPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'tennis';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageTeams sport={sport} sportIcon={sportIcon} initialTeams={INITIAL} />
      </div>
    </AdminShell>
  );
}
