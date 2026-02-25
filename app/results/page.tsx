'use client';

import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

const RESULTS = [
  {
    id: 1,
    sport: 'Cricket',
    team1: 'Team C',
    team2: 'Team D',
    score1: 178,
    score2: 165,
    winner: 'Team C',
    date: '2024-02-01',
    venue: 'Main Ground',
  },
  {
    id: 2,
    sport: 'Football',
    team1: 'Strikers',
    team2: 'Warriors',
    score1: 3,
    score2: 2,
    winner: 'Strikers',
    date: '2024-02-01',
    venue: 'Stadium',
  },
  {
    id: 3,
    sport: 'Volleyball',
    team1: 'Team P',
    team2: 'Team Q',
    score1: 3,
    score2: 1,
    winner: 'Team P',
    date: '2024-01-31',
    venue: 'Sports Hall',
  },
  {
    id: 4,
    sport: 'Basketball',
    team1: 'Scorchers',
    team2: 'Hawks',
    score1: 92,
    score2: 88,
    winner: 'Scorchers',
    date: '2024-01-31',
    venue: 'Court A',
  },
];

export default function ResultsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Top bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Match Results</h1>
              <p className="text-xs text-muted-foreground">Completed matches and final scores</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-500" />
              Match Results
            </h2>
            <p className="text-muted-foreground">View all completed matches and winners</p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8 overflow-x-auto">
            <Badge className="bg-primary/20 text-primary cursor-pointer">All Sports</Badge>
            <Badge variant="outline" className="cursor-pointer">Cricket</Badge>
            <Badge variant="outline" className="cursor-pointer">Football</Badge>
            <Badge variant="outline" className="cursor-pointer">Volleyball</Badge>
            <Badge variant="outline" className="cursor-pointer">Basketball</Badge>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {RESULTS.map((result) => (
              <Card key={result.id} className="bg-card border-border hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-green-500 text-white">COMPLETED</Badge>
                        <span className="text-sm font-semibold text-primary">{result.sport}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{result.date}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{result.venue}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-8">
                        <div className={result.winner === result.team1 ? 'opacity-100' : 'opacity-60'}>
                          <p className="font-semibold mb-1 flex items-center gap-2">
                            {result.team1}
                            {result.winner === result.team1 && (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            )}
                          </p>
                          <p className="text-3xl font-bold text-primary">{result.score1}</p>
                        </div>

                        <div className="flex items-center justify-center">
                          <span className="text-muted-foreground font-medium">vs</span>
                        </div>

                        <div className={`text-right ${result.winner === result.team2 ? 'opacity-100' : 'opacity-60'}`}>
                          <p className="font-semibold mb-1 flex items-center justify-end gap-2">
                            {result.team2}
                            {result.winner === result.team2 && (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            )}
                          </p>
                          <p className="text-3xl font-bold">{result.score2}</p>
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
