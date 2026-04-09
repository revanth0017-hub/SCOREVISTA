'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminAssistantPanel } from '@/components/admin-assistant-panel';
import { api } from '@/lib/api';
import { getAdminSport, setAdminSport } from '@/lib/admin-sport';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

function AssistantPageContent() {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('sport')?.toLowerCase();
  const fromStorage = getAdminSport()?.toLowerCase();
  const sport = (fromUrl || fromStorage || 'cricket').toLowerCase();
  const sportEmoji = SPORT_EMOJI[sport] || '🏆';

  useEffect(() => {
    if (fromUrl) setAdminSport(fromUrl);
  }, [fromUrl]);

  const [sportId, setSportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const sportsRes = await api.get<{ success: boolean; data: { _id: string; slug: string }[] }>(
          '/api/sports'
        );
        const sports = (sportsRes as { data?: { _id: string; slug: string }[] }).data || [];
        const s = sports.find((x) => x.slug === sport);
        if (!cancelled) setSportId(s?._id ?? null);
      } catch {
        if (!cancelled) setSportId(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sport]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AdminSidebar sport={sport} sportIcon={sportEmoji} />
      <main className="flex-1 min-h-0 flex flex-col p-4 md:p-6 bg-background overflow-hidden">
        <AdminAssistantPanel sportId={sportId} sportSlug={sport} sportLoading={loading} />
      </main>
    </div>
  );
}

export default function AdminAssistantPage() {
  return (
    <Suspense fallback={null}>
      <AssistantPageContent />
    </Suspense>
  );
}
