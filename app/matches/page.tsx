'use client';

import { Sidebar } from '@/components/sidebar';
import { Badge } from '@/components/ui/badge';
import { SportMatchesList } from '@/components/sport-matches-list';
import { useMemo, useState } from 'react';

export default function MatchesPage() {
  const [filter, setFilter] = useState<'all' | 'cricket' | 'football' | 'volleyball'>('all');
  const sports = useMemo(() => ([
    { slug: 'cricket', label: 'Cricket' },
    { slug: 'football', label: 'Football' },
    { slug: 'volleyball', label: 'Volleyball' },
  ]), []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Top bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Live Matches</h1>
              <p className="text-xs text-muted-foreground">Track all live and upcoming matches</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Featured Matches</h2>
            <p className="text-muted-foreground">Explore live matches across all sports</p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8 overflow-x-auto">
            <Badge
              className={`${filter === 'all' ? 'bg-primary/20 text-primary' : 'bg-background'} cursor-pointer`}
              onClick={() => setFilter('all')}
            >
              All Sports
            </Badge>
            {sports.map((s) => (
              <Badge
                key={s.slug}
                variant="outline"
                className={`${filter === (s.slug as any) ? 'border-primary text-primary' : ''} cursor-pointer`}
                onClick={() => setFilter(s.slug as any)}
              >
                {s.label}
              </Badge>
            ))}
          </div>

          {/* Matches List */}
          <div className="space-y-10">
            {(filter === 'all' ? sports : sports.filter((s) => s.slug === filter)).map((s) => (
              <div key={s.slug}>
                <h3 className="text-xl font-semibold mb-4">{s.label}</h3>
                <SportMatchesList sport={s.slug} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
