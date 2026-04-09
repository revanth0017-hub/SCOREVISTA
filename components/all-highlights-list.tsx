'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

type SportDoc = { _id: string; name: string; slug: string; icon?: string };
type HighlightDoc = {
  _id: string;
  title: string;
  sport: string; // sportId
  date?: string;
  views?: number;
  duration?: string;
  description?: string;
  videoUrl?: string;
};

export function AllHighlightsList() {
  const [sports, setSports] = useState<SportDoc[]>([]);
  const [items, setItems] = useState<HighlightDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const sportsRes = await api.get<{ success: boolean; data: SportDoc[] }>('/api/sports');
        const s = (sportsRes as { data?: SportDoc[] }).data || [];
        if (cancelled) return;
        setSports(s);

        const highlights = await Promise.all(
          s.map(async (sp) => {
            const res = await api.get<{ success: boolean; data: HighlightDoc[] }>(
              `/api/highlights?sportId=${encodeURIComponent(sp._id)}`
            );
            return ((res as { data?: HighlightDoc[] }).data || []).map((h) => h);
          })
        );
        const all = highlights
          .flat()
          .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
          .reverse();
        if (!cancelled) setItems(all);
      } catch {
        if (!cancelled) {
          setSports([]);
          setItems([]);
        }
      }
    })().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const onHighlightAdded = (h: HighlightDoc) => {
      setItems((prev) => [h, ...prev]);
    };
    socket.on('highlightAdded', onHighlightAdded);
    return () => {
      socket.off('highlightAdded', onHighlightAdded);
    };
  }, []);

  const sportName = (sportId: string) => sports.find((s) => s._id === sportId)?.name || 'Sport';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Loading highlights...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6 text-center text-muted-foreground py-12">
          <p>No highlights yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {items.map((h) => (
        <Card key={h._id} className="bg-card border-border hover:border-orange-500/50 transition overflow-hidden">
          <div className="flex gap-4">
            <div className="w-40 h-32 bg-background flex items-center justify-center text-5xl flex-shrink-0 border-r border-border">
              <span>{sports.find((s) => s._id === h.sport)?.icon || '🔥'}</span>
            </div>
            <CardContent className="flex-1 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{h.title}</h3>
                  {h.description && <p className="text-muted-foreground text-sm mb-3">{h.description}</p>}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge className="bg-orange-500/20 text-orange-400">{sportName(h.sport)}</Badge>
                    {h.date && <span className="text-xs text-muted-foreground">{h.date}</span>}
                    {h.duration && <span className="text-xs text-muted-foreground">{h.duration}</span>}
                    {h.views != null && <span className="text-xs text-muted-foreground">{h.views.toLocaleString()} views</span>}
                  </div>
                </div>
                {h.videoUrl && (
                  <a href={h.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Watch
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}

