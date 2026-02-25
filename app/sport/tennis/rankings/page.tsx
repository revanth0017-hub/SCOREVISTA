'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

const RANKINGS = [
  { rank: 1, player: 'Federer', country: 'Switzerland', matches: 64, points: 9860 },
  { rank: 2, player: 'Nadal', country: 'Spain', matches: 61, points: 9720 },
  { rank: 3, player: 'Djokovic', country: 'Serbia', matches: 60, points: 9680 },
];

export default function TennisRankingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="tennis" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="text-3xl">🎾</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Tennis</h1>
                <p className="text-sm text-muted-foreground mt-1">ATP player rankings</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                ATP Rankings
              </h2>
              <p className="text-sm text-muted-foreground">Current season standings</p>
            </div>
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Rank</th>
                        <th className="text-left py-3 px-4 font-semibold">Player</th>
                        <th className="text-left py-3 px-4 font-semibold">Country</th>
                        <th className="text-left py-3 px-4 font-semibold">Matches</th>
                        <th className="text-left py-3 px-4 font-semibold">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RANKINGS.map((entry) => (
                        <tr key={entry.rank} className="border-b border-border hover:bg-background/50 transition">
                          <td className="py-3 px-4 font-bold">
                            <Badge className="bg-lime-600/20 text-lime-400">#{entry.rank}</Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">{entry.player}</td>
                          <td className="py-3 px-4 text-sm">{entry.country}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-blue-500/20 text-blue-400">{entry.matches}</Badge>
                          </td>
                          <td className="py-3 px-4 font-bold text-lg">{entry.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
