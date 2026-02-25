'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

const RANKINGS = [
  { rank: 1, team: 'Tigers', played: 10, wins: 8, losses: 2, points: 16 },
  { rank: 2, team: 'Panthers', played: 10, wins: 7, losses: 3, points: 14 },
  { rank: 3, team: 'Warriors', played: 10, wins: 6, losses: 4, points: 12 },
];

export default function KabaddiRankingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="kabaddi" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-pink-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Kabaddi</h1>
                <p className="text-sm text-muted-foreground mt-1">League rankings and standings</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-pink-500" />
                League Rankings
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
                        <th className="text-left py-3 px-4 font-semibold">Team</th>
                        <th className="text-left py-3 px-4 font-semibold">Played</th>
                        <th className="text-left py-3 px-4 font-semibold">Wins</th>
                        <th className="text-left py-3 px-4 font-semibold">Losses</th>
                        <th className="text-left py-3 px-4 font-semibold">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RANKINGS.map((entry) => (
                        <tr key={entry.rank} className="border-b border-border hover:bg-background/50 transition">
                          <td className="py-3 px-4 font-bold">
                            <Badge className="bg-red-500/20 text-red-400">#{entry.rank}</Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">{entry.team}</td>
                          <td className="py-3 px-4">{entry.played}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-green-500/20 text-green-400">{entry.wins}W</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-red-500/20 text-red-400">{entry.losses}L</Badge>
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
