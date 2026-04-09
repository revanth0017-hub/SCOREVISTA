'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

type SportDoc = { _id: string; slug: string; name: string };
type TeamDoc = { _id: string; name: string };
type MatchDoc = {
  _id: string;
  sport: string;
  teamA: TeamDoc;
  teamB: TeamDoc;
  venue?: string;
  date?: string;
  time?: string;
  status?: string;
  scoreA?: number;
  scoreB?: number;
};

export function SportMatchesList({ sport }: { sport: string }) {
  const sportSlug = useMemo(() => sport.toLowerCase(), [sport]);
  const [sportId, setSportId] = useState<string | null>(null);
  const [list, setList] = useState<MatchDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const sportsRes = await api.get<{ success: boolean; data: SportDoc[] }>('/api/sports');
        const sports = (sportsRes as { data?: SportDoc[] }).data || [];
        const s = sports.find((x) => x.slug === sportSlug);
        if (!s?._id) {
          if (!cancelled) {
            setSportId(null);
            setList([]);
          }
          return;
        }
        if (!cancelled) setSportId(s._id);

        const res = await api.get<{ success: boolean; data: MatchDoc[] }>(
          `/api/matches?sportId=${encodeURIComponent(s._id)}`
        );
        const data = (res as { data?: MatchDoc[] }).data || [];
        if (!cancelled) setList(data);
      } catch {
        if (!cancelled) {
          setSportId(null);
          setList([]);
        }
      }
    })().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sportSlug]);

  useEffect(() => {
    if (!sportId) return;
    const socket = getSocket();
    socket.emit('joinSport', { sportId });

    const onMatchCreated = (m: MatchDoc) => {
      if (m?.sport !== sportId) return;
      setList((prev) => [m, ...prev]);
    };
    const onScoreUpdated = (m: MatchDoc) => {
      if (m?.sport !== sportId) return;
      setList((prev) => prev.map((x) => (x._id === m._id ? m : x)));
    };

    socket.on('matchCreated', onMatchCreated);
    socket.on('scoreUpdated', onScoreUpdated);
    return () => {
      socket.off('matchCreated', onMatchCreated);
      socket.off('scoreUpdated', onScoreUpdated);
    };
  }, [sportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Loading matches...
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6 text-center text-muted-foreground py-12">
          <p>No matches yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((m) => (
        <Card key={m._id} className="bg-card border-border hover:border-primary/50 transition">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={m.status === 'live' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}>
                    {(m.status || 'upcoming').toUpperCase()}
                  </Badge>
                  {m.venue && <span className="text-sm text-muted-foreground">{m.venue}</span>}
                </div>
                <div className="grid grid-cols-3 gap-8 items-center">
                  <div>
                    <p className="font-semibold mb-1">{m.teamA?.name}</p>
                    <p className="text-3xl font-bold text-primary">{m.scoreA ?? 0}</p>
                  </div>
                  <div className="text-center text-muted-foreground font-medium">vs</div>
                  <div className="text-right">
                    <p className="font-semibold mb-1">{m.teamB?.name}</p>
                    <p className="text-3xl font-bold">{m.scoreB ?? 0}</p>
                  </div>
                </div>
                {(m.date || m.time) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {[m.date, m.time].filter(Boolean).join(' ')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

