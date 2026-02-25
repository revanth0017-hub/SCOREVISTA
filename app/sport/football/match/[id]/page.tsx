'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MATCH_DATA = {
  team1: 'Eagles',
  team2: 'Lions',
  score1: 3,
  score2: 2,
  status: 'completed',
  venue: 'Stadium',
  date: '2024-02-01',
  winner: 'Eagles',
  margin: '1 goal',
};

const GOALS_TEAM1 = [
  { id: 1, player: 'Cristiano Ronaldo', minute: 12, type: 'Open Play' },
  { id: 2, player: 'Luka Modric', minute: 34, type: 'Penalty' },
  { id: 3, player: 'Vinicius Jr', minute: 67, type: 'Open Play' },
];

const GOALS_TEAM2 = [
  { id: 1, player: 'Lionel Messi', minute: 21, type: 'Free Kick' },
  { id: 2, player: 'Neymar', minute: 55, type: 'Open Play' },
];

const PLAYER_STATS_TEAM1 = [
  { id: 1, name: 'Cristiano Ronaldo', position: 'Forward', goals: 1, assists: 1, shots: 6, passes: 45, touches: 67 },
  { id: 2, name: 'Luka Modric', position: 'Midfielder', goals: 1, assists: 0, shots: 2, passes: 78, touches: 89 },
  { id: 3, name: 'Vinicius Jr', position: 'Forward', goals: 1, assists: 1, shots: 5, passes: 32, touches: 54 },
];

const PLAYER_STATS_TEAM2 = [
  { id: 1, name: 'Lionel Messi', position: 'Forward', goals: 1, assists: 1, shots: 7, passes: 52, touches: 72 },
  { id: 2, name: 'Neymar', position: 'Forward', goals: 1, assists: 0, shots: 4, passes: 38, touches: 61 },
];

export default function FootballMatchDetailPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="football" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section with Back Button */}
          <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-b border-border px-8 py-6">
            <Link href="/sport/football/live" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Matches</span>
            </Link>
            
            {/* Match Score Display */}
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team1}</p>
                <p className="text-5xl font-bold text-green-500">{MATCH_DATA.score1}</p>
              </div>
              
              <div className="text-center space-y-2 px-8">
                <Badge className="bg-green-500 text-white px-4 py-1.5 text-sm font-semibold">
                  {MATCH_DATA.status.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground font-medium">{MATCH_DATA.margin}</p>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team2}</p>
                <p className="text-5xl font-bold text-red-500">{MATCH_DATA.score2}</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Match Info Card */}
            <Card className="bg-card border-border mb-6">
              <CardContent className="p-6">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">MATCH INFO</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Venue:</span>
                    <span className="font-bold text-foreground">{MATCH_DATA.venue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-bold text-foreground">{MATCH_DATA.date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger value="goals">Goals & Events</TabsTrigger>
                <TabsTrigger value="stats-team1">Stats {MATCH_DATA.team1}</TabsTrigger>
                <TabsTrigger value="stats-team2">Stats {MATCH_DATA.team2}</TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-2xl">Goals Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Team 1 Goals */}
                    <div>
                      <p className="font-bold text-lg mb-3 text-foreground">{MATCH_DATA.team1} Goals</p>
                      <div className="space-y-2">
                        {GOALS_TEAM1.map((goal) => (
                          <div key={goal.id} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="font-bold text-foreground">{goal.player}</span>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-blue-500 text-white">{goal.type}</Badge>
                              <span className="text-muted-foreground font-medium">{goal.minute}'</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Team 2 Goals */}
                    <div>
                      <p className="font-bold text-lg mb-3 text-foreground">{MATCH_DATA.team2} Goals</p>
                      <div className="space-y-2">
                        {GOALS_TEAM2.map((goal) => (
                          <div key={goal.id} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="font-bold text-foreground">{goal.player}</span>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-blue-500 text-white">{goal.type}</Badge>
                              <span className="text-muted-foreground font-medium">{goal.minute}'</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats-team1" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-2xl">{MATCH_DATA.team1} - Player Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="text-left py-3 px-4 font-bold text-muted-foreground">Player</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Pos</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Goals</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Assists</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Shots</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Passes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PLAYER_STATS_TEAM1.map((player) => (
                            <tr key={player.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="py-4 px-4 font-bold text-foreground">{player.name}</td>
                              <td className="text-center py-4 px-4 text-muted-foreground">{player.position}</td>
                              <td className="text-center py-4 px-4 font-bold text-green-500 text-lg">{player.goals}</td>
                              <td className="text-center py-4 px-4 font-bold text-blue-500 text-lg">{player.assists}</td>
                              <td className="text-center py-4 px-4 text-foreground">{player.shots}</td>
                              <td className="text-center py-4 px-4 text-foreground">{player.passes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats-team2" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-2xl">{MATCH_DATA.team2} - Player Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="text-left py-3 px-4 font-bold text-muted-foreground">Player</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Pos</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Goals</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Assists</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Shots</th>
                            <th className="text-center py-3 px-4 font-bold text-muted-foreground">Passes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PLAYER_STATS_TEAM2.map((player) => (
                            <tr key={player.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="py-4 px-4 font-bold text-foreground">{player.name}</td>
                              <td className="text-center py-4 px-4 text-muted-foreground">{player.position}</td>
                              <td className="text-center py-4 px-4 font-bold text-green-500 text-lg">{player.goals}</td>
                              <td className="text-center py-4 px-4 font-bold text-blue-500 text-lg">{player.assists}</td>
                              <td className="text-center py-4 px-4 text-foreground">{player.shots}</td>
                              <td className="text-center py-4 px-4 text-foreground">{player.passes}</td>
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
