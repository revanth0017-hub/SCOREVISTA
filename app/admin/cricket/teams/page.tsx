'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminManageTeams } from '@/components/admin-manage-teams';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

export default function CricketTeamsPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'cricket';
  const sportIcon = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminManageTeams sport={sport} sportIcon={sportIcon} />
      </div>
    </AdminShell>
  );
}
