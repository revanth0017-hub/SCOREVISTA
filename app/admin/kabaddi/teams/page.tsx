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
  { id: 1, name: 'Dragons', players: 7, wins: 4, losses: 1, captain: '' },
  { id: 2, name: 'Tigers', players: 7, wins: 3, losses: 2, captain: '' },
];

export default function KabaddiTeamsPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'kabaddi';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageTeams sport={sport} sportIcon={sportIcon} initialTeams={INITIAL} />
      </div>
    </AdminShell>
  );
}
