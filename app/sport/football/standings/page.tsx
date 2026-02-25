'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent } from '@/components/ui/card';

const STANDINGS = [
  { pos: 1, team: 'Manchester City', games: 25, wins: 20, draws: 3, losses: 2, points: 63 },
  { pos: 2, team: 'Arsenal', games: 25, wins: 19, draws: 2, losses: 4, points: 59 },
  { pos: 3, team: 'Liverpool', games: 25, wins: 17, draws: 4, losses: 4, points: 55 },
];

export default function FootballStandingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="football" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-3xl">⚽</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Football Standings</h1>
                <p className="text-sm text-muted-foreground mt-1">View league table and rankings</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">League Table</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b-2 border-border">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold text-muted-foreground">Pos</th>
                        <th className="text-left py-3 px-4 font-bold text-muted-foreground">Team</th>
                        <th className="text-center py-3 px-4 font-bold text-muted-foreground">P</th>
                        <th className="text-center py-3 px-4 font-bold text-muted-foreground">W</th>
                        <th className="text-center py-3 px-4 font-bold text-muted-foreground">D</th>
                        <th className="text-center py-3 px-4 font-bold text-muted-foreground">L</th>
                        <th className="text-center py-3 px-4 font-bold text-muted-foreground">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STANDINGS.map((row) => (
                        <tr key={row.pos} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4 font-bold">{row.pos}</td>
                          <td className="py-4 px-4 font-bold text-foreground">{row.team}</td>
                          <td className="text-center py-4 px-4 text-foreground">{row.games}</td>
                          <td className="text-center py-4 px-4 font-bold text-green-500">{row.wins}</td>
                          <td className="text-center py-4 px-4 font-bold text-amber-500">{row.draws}</td>
                          <td className="text-center py-4 px-4 font-bold text-red-500">{row.losses}</td>
                          <td className="text-center py-4 px-4 font-bold text-lg">{row.points}</td>
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
