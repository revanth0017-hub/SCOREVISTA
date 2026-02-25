'use client';

import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MATCHES = [
  {
    id: 1,
    sport: 'Cricket',
    team1: 'Team A',
    team2: 'Team B',
    score1: 142,
    score2: 89,
    status: 'live',
    venue: 'Main Ground',
  },
  {
    id: 2,
    sport: 'Football',
    team1: 'Eagles',
    team2: 'Lions',
    score1: 2,
    score2: 1,
    status: 'live',
    venue: 'Stadium',
  },
  {
    id: 3,
    sport: 'Volleyball',
    team1: 'Team X',
    team2: 'Team Y',
    score1: 2,
    score2: 1,
    status: 'completed',
    venue: 'Sports Hall',
  },
];

export default function MatchesPage() {
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
            <Badge className="bg-primary/20 text-primary cursor-pointer">All Sports</Badge>
            <Badge variant="outline" className="cursor-pointer">Live Only</Badge>
            <Badge variant="outline" className="cursor-pointer">Cricket</Badge>
            <Badge variant="outline" className="cursor-pointer">Football</Badge>
            <Badge variant="outline" className="cursor-pointer">Volleyball</Badge>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {MATCHES.map((match) => (
              <Card key={match.id} className="bg-card border-border hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className={match.status === 'live' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}>
                          {match.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-semibold text-primary">{match.sport}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{match.venue}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-8">
                        <div>
                          <p className="font-semibold mb-1">{match.team1}</p>
                          <p className="text-3xl font-bold text-primary">{match.score1}</p>
                        </div>

                        <div className="flex items-center justify-center">
                          <span className="text-muted-foreground font-medium">vs</span>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold mb-1">{match.team2}</p>
                          <p className="text-3xl font-bold">{match.score2}</p>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="ml-4 bg-transparent">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
