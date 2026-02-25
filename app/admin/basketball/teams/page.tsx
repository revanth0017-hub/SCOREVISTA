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
  { id: 1, name: 'Scorchers', players: 12, wins: 8, losses: 2, captain: '' },
  { id: 2, name: 'Hawks', players: 12, wins: 7, losses: 3, captain: '' },
];

export default function BasketballTeamsPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'basketball';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageTeams sport={sport} sportIcon={sportIcon} initialTeams={INITIAL} />
      </div>
    </AdminShell>
  );
}
