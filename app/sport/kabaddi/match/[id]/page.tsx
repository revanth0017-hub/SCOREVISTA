'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MATCH_DATA = {
  team1: 'Dragons',
  score1: 32,
  team2: 'Tigers',
  score2: 28,
  venue: 'Arena',
  date: '2024-02-01',
};

const PLAYER_STATS = [
  { id: 1, name: 'Raider A', team: 'Dragons', points: 12, raids: 8, tackles: 3 },
  { id: 2, name: 'Defender B', team: 'Tigers', points: 10, raids: 2, tackles: 12 },
];

export default function KabaddiMatchDetailPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="kabaddi" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section with Score Display */}
          <div className="bg-gradient-to-r from-pink-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team1}</p>
                <p className="text-5xl md:text-6xl font-bold text-pink-500">{MATCH_DATA.score1}</p>
              </div>
              
              <div className="text-center space-y-2 px-8">
                <Badge className="bg-green-500 text-white px-4 py-1.5 text-sm font-semibold">
                  COMPLETED
                </Badge>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team2}</p>
                <p className="text-5xl md:text-6xl font-bold text-red-500">{MATCH_DATA.score2}</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <Card className="bg-card/50 border-border shadow-md">
            <CardHeader>
              <CardTitle>Player Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2">Player</th>
                      <th className="text-center py-2 px-2">Team</th>
                      <th className="text-center py-2 px-2">Points</th>
                      <th className="text-center py-2 px-2">Raids</th>
                      <th className="text-center py-2 px-2">Tackles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAYER_STATS.map((player) => (
                      <tr key={player.id} className="border-b border-border">
                        <td className="py-3 px-2 font-semibold">{player.name}</td>
                        <td className="text-center py-3 px-2">{player.team}</td>
                        <td className="text-center py-3 px-2 font-bold text-green-500">{player.points}</td>
                        <td className="text-center py-3 px-2">{player.raids}</td>
                        <td className="text-center py-3 px-2">{player.tackles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
