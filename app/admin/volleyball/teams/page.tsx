'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminManageTeamsWithPlayers } from '@/components/admin-manage-teams-with-players';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

export default function VolleyballTeamsPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'volleyball';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageTeamsWithPlayers sport={sport} sportIcon={sportIcon} />
      </div>
    </AdminShell>
  );
}
