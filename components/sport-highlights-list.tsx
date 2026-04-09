'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type SportDoc = { _id: string; slug: string; name: string };

interface HighlightDoc {
  _id: string;
  title: string;
  sport: string; // ObjectId
  date?: string;
  views?: number;
  duration?: string;
  description?: string;
  videoUrl?: string;
}

export function SportHighlightsList({ sport }: { sport: string }) {
  const [list, setList] = useState<HighlightDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const sports = await api.get<{ success: boolean; data: SportDoc[] }>('/api/sports');
        const sportList = (sports as { data?: SportDoc[] }).data || [];
        const s = sportList.find((x) => x.slug === sport.toLowerCase());
        if (!s?._id) {
          if (!cancelled) setList([]);
          return;
        }

        const res = await api.get<{ success?: boolean; data?: HighlightDoc[] }>(
          `/api/highlights?sportId=${encodeURIComponent(s._id)}`
        );
        const data = (res as { data?: HighlightDoc[] }).data ?? [];
        if (!cancelled) setList(data);
      } catch {
        if (!cancelled) setList([]);
      }
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [sport]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Loading highlights...
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-6 text-center text-muted-foreground py-12">
          <p>No highlights yet. Check back later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((h) => (
        <Card key={h._id} className="bg-card border-border hover:border-primary/50 transition">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-2">{h.title}</h3>
                {h.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{h.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {h.date && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {new Date(h.date).toLocaleDateString()}
                    </Badge>
                  )}
                  {h.views != null && (
                    <Badge variant="outline">
                      {(h.views ?? 0).toLocaleString()} views
                    </Badge>
                  )}
                  {h.duration && (
                    <Badge variant="outline">{h.duration}</Badge>
                  )}
                </div>
              </div>
              {h.videoUrl && (
                <a
                  href={h.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  <Play className="w-4 h-4" />
                  Watch
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
