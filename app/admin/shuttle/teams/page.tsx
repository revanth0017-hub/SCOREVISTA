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
  { id: 1, name: 'Rackets United', players: 4, wins: 5, losses: 1, captain: '' },
  { id: 2, name: 'Shuttlecock Kings', players: 4, wins: 4, losses: 2, captain: '' },
];

export default function ShuttleTeamsPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'shuttle';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageTeams sport={sport} sportIcon={sportIcon} initialTeams={INITIAL} />
      </div>
    </AdminShell>
  );
}
