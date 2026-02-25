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
  { id: 1, name: 'Team X', players: 12, wins: 6, losses: 1, captain: 'Captain X' },
  { id: 2, name: 'Team Y', players: 12, wins: 5, losses: 2, captain: 'Captain Y' },
];

export default function VolleyballTeamsPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'volleyball';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageTeams sport={sport} sportIcon={sportIcon} initialTeams={INITIAL} />
      </div>
    </AdminShell>
  );
}
