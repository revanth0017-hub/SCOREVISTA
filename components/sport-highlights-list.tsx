'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface HighlightDoc {
  _id: string;
  title: string;
  sport: string;
  date?: string;
  views?: number;
  duration?: string;
  description?: string;
  videoUrl?: string;
}

export function SportHighlightsList({ sport }: { sport: string }) {
  const [list, setList] = useState<HighlightDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<{ success?: boolean; data?: HighlightDoc[] }>(`/api/highlights?sport=${encodeURIComponent(sport)}`)
      .then((res) => {
        if (!cancelled) {
          const data = (res as { data?: HighlightDoc[] }).data ?? [];
          setList(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setList([]);
          setError(err instanceof Error ? err.message : 'Unable to load. Is the backend running on port 5001?');
        }
      })
      .finally(() => {
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

  if (error) {
    return (
      <Card className="bg-card border-border border-amber-500/50">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-amber-600 dark:text-amber-400 mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Start the backend with: cd backend && npm run dev</p>
        </CardContent>
      </Card>
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
