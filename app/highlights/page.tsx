'use client';

import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Play } from 'lucide-react';

const HIGHLIGHTS = [
  {
    id: 1,
    title: 'India vs Australia - T20 Final Highlights',
    sport: 'Cricket',
    date: '2024-02-10',
    views: 5200,
    duration: '8:45',
    thumbnail: '🏏',
    description: 'Watch the incredible moments from the T20 final between India and Australia.',
  },
  {
    id: 2,
    title: 'Epic Football Derby - Best Goals',
    sport: 'Football',
    date: '2024-02-09',
    views: 3800,
    duration: '6:32',
    thumbnail: '⚽',
    description: 'The most exciting goals from the legendary football derby match.',
  },
  {
    id: 3,
    title: 'Volleyball Championship - Winning Spikes',
    sport: 'Volleyball',
    date: '2024-02-08',
    views: 2400,
    duration: '5:15',
    thumbnail: '🏐',
    description: 'Best spikes and winning moments from the championship match.',
  },
  {
    id: 4,
    title: 'Basketball Playoffs - Amazing Dunks',
    sport: 'Basketball',
    date: '2024-02-07',
    views: 4100,
    duration: '7:20',
    thumbnail: '🏀',
    description: 'Spectacular dunks and clutch plays from the playoff series.',
  },
  {
    id: 5,
    title: 'Kabaddi Finals - Raid Masters',
    sport: 'Kabaddi',
    date: '2024-02-06',
    views: 1900,
    duration: '6:45',
    thumbnail: '👥',
    description: 'Exceptional raiding and defensive plays from the kabaddi finals.',
  },
  {
    id: 6,
    title: 'Badminton Tournament - Rally Highlights',
    sport: 'Shuttle',
    date: '2024-02-05',
    views: 2100,
    duration: '4:50',
    thumbnail: '🏸',
    description: 'The longest rallies and most exciting moments from the tournament.',
  },
];

const SPORT_COLORS: Record<string, string> = {
  Cricket: 'bg-green-500/20 text-green-400',
  Football: 'bg-blue-500/20 text-blue-400',
  Volleyball: 'bg-orange-500/20 text-orange-400',
  Basketball: 'bg-amber-500/20 text-amber-400',
  Kabaddi: 'bg-red-500/20 text-red-400',
  Shuttle: 'bg-teal-500/20 text-teal-400',
  Tennis: 'bg-lime-500/20 text-lime-400',
};

export default function HighlightsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-6">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold">Highlights</h1>
              <p className="text-muted-foreground">Watch the most exciting moments from all sports</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid gap-6">
            {HIGHLIGHTS.map((highlight) => (
              <Card key={highlight.id} className="bg-card border-border hover:border-orange-500/50 transition overflow-hidden">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-40 h-32 bg-background flex items-center justify-center text-5xl flex-shrink-0 border-r border-border">
                    {highlight.thumbnail}
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{highlight.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{highlight.description}</p>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={SPORT_COLORS[highlight.sport] || 'bg-gray-500/20'}>
                            {highlight.sport}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{highlight.date}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{highlight.views.toLocaleString()} views</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{highlight.duration}</span>
                        </div>
                      </div>
                      <Button className="ml-4 gap-2 bg-orange-500 hover:bg-orange-600">
                        <Play className="w-4 h-4" />
                        Watch
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
