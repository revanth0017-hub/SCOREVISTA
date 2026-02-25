'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MATCH_DATA = {
  team1: 'Scorchers',
  score1: 92,
  team2: 'Hawks',
  score2: 88,
  venue: 'Sports Arena',
  date: '2024-02-01',
};

const QUARTER_SCORES = [
  { quarter: 'Q1', team1: 24, team2: 22 },
  { quarter: 'Q2', team1: 23, team2: 21 },
  { quarter: 'Q3', team1: 21, team2: 23 },
  { quarter: 'Q4', team1: 24, team2: 22 },
];

const PLAYER_STATS = [
  { id: 1, name: 'James Chen', team: 'Scorchers', position: 'Guard', points: 28, rebounds: 6, assists: 8, steals: 2 },
  { id: 2, name: 'Mike Johnson', team: 'Hawks', position: 'Forward', points: 26, rebounds: 10, assists: 4, steals: 1 },
];

export default function BasketballMatchDetailPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="basketball" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section with Score Display */}
          <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team1}</p>
                <p className="text-5xl md:text-6xl font-bold text-orange-500">{MATCH_DATA.score1}</p>
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
            <Tabs defaultValue="quarters" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quarters">Quarter Scores</TabsTrigger>
                <TabsTrigger value="stats">Player Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="quarters">
                <Card className="bg-card border-border mt-4">
                  <CardHeader>
                    <CardTitle>Quarter Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {QUARTER_SCORES.map((q) => (
                        <div key={q.quarter} className="flex items-center justify-between p-4 bg-background rounded-lg">
                          <span className="font-semibold w-12">{q.quarter}</span>
                          <div className="flex-1 flex items-center gap-4 ml-4">
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{MATCH_DATA.team1}</span>
                              <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{ width: `${(q.team1 / 30) * 100}%` }}></div>
                              </div>
                              <span className="font-bold">{q.team1}</span>
                            </div>
                            <span className="text-muted-foreground">|</span>
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{MATCH_DATA.team2}</span>
                              <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full" style={{ width: `${(q.team2 / 30) * 100}%` }}></div>
                              </div>
                              <span className="font-bold">{q.team2}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats">
                <Card className="bg-card border-border mt-4">
                  <CardHeader>
                    <CardTitle>Player Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-2">Player</th>
                            <th className="text-center py-2 px-2">Team</th>
                            <th className="text-center py-2 px-2">Points</th>
                            <th className="text-center py-2 px-2">Rebounds</th>
                            <th className="text-center py-2 px-2">Assists</th>
                            <th className="text-center py-2 px-2">Steals</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PLAYER_STATS.map((player) => (
                            <tr key={player.id} className="border-b border-border">
                              <td className="py-3 px-2 font-semibold">{player.name}</td>
                              <td className="text-center py-3 px-2">{player.team}</td>
                              <td className="text-center py-3 px-2 font-bold text-green-500">{player.points}</td>
                              <td className="text-center py-3 px-2">{player.rebounds}</td>
                              <td className="text-center py-3 px-2">{player.assists}</td>
                              <td className="text-center py-3 px-2">{player.steals}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
