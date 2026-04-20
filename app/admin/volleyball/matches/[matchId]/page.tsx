'use client';

import { AdminMatchScorePage } from '@/components/admin-match-score-page';

interface PageProps {
  params: {
    matchId: string;
  };
}

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

export default function VolleyballMatchScorePage({ params }: PageProps) {
  return <AdminMatchScorePage matchId={params.matchId} sportSlug="volleyball" sportIcon={SPORT_EMOJI.volleyball} />;
}
