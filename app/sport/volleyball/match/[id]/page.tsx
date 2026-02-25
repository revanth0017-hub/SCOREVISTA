'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MATCH_DATA = {
  team1: 'Team X',
  team2: 'Team Y',
  sets: '3-1',
  venue: 'Sports Hall',
  date: '2024-02-01',
};

const SET_SCORES = [
  { set: 1, team1: 25, team2: 20 },
  { set: 2, team1: 23, team2: 25 },
  { set: 3, team1: 25, team2: 18 },
  { set: 4, team1: 25, team2: 22 },
];

const PLAYER_STATS = [
  { id: 1, name: 'Alice Johnson', position: 'Setter', team: 'Team X', points: 24, kills: 18, blocks: 2, aces: 4 },
  { id: 2, name: 'Bob Smith', position: 'Spiker', team: 'Team Y', points: 28, kills: 22, blocks: 3, aces: 3 },
];

export default function VolleyballMatchDetailPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="volleyball" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section with Score Display */}
          <div className="bg-gradient-to-r from-red-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team1}</p>
              </div>
              
              <div className="text-center space-y-2 px-8">
                <p className="text-5xl md:text-6xl font-bold text-red-500">{MATCH_DATA.sets}</p>
                <p className="text-sm text-muted-foreground font-medium">Sets</p>
                <Badge className="bg-green-500 text-white px-4 py-1.5 text-sm font-semibold mt-2">
                  COMPLETED
                </Badge>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team2}</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <Tabs defaultValue="sets" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sets">Set Scores</TabsTrigger>
                <TabsTrigger value="stats">Player Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="sets">
                <Card className="bg-card border-border mt-4">
                  <CardHeader>
                    <CardTitle>Set Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {SET_SCORES.map((set) => (
                        <div key={set.set} className="flex items-center justify-between p-4 bg-background rounded-lg">
                          <span className="font-semibold">Set {set.set}</span>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">{MATCH_DATA.team1}</p>
                              <p className="text-2xl font-bold">{set.team1}</p>
                            </div>
                            <span>-</span>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">{MATCH_DATA.team2}</p>
                              <p className="text-2xl font-bold">{set.team2}</p>
                            </div>
                          </div>
                          <Badge>{set.team1 > set.team2 ? MATCH_DATA.team1 : MATCH_DATA.team2} Won</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats">
                <Card className="bg-card border-border mt-4">
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
                            <th className="text-center py-2 px-2">Position</th>
                            <th className="text-center py-2 px-2">Points</th>
                            <th className="text-center py-2 px-2">Kills</th>
                            <th className="text-center py-2 px-2">Blocks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PLAYER_STATS.map((player) => (
                            <tr key={player.id} className="border-b border-border">
                              <td className="py-3 px-2 font-semibold">{player.name}</td>
                              <td className="text-center py-3 px-2">{player.team}</td>
                              <td className="text-center py-3 px-2">{player.position}</td>
                              <td className="text-center py-3 px-2 font-bold text-green-500">{player.points}</td>
                              <td className="text-center py-3 px-2">{player.kills}</td>
                              <td className="text-center py-3 px-2">{player.blocks}</td>
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
