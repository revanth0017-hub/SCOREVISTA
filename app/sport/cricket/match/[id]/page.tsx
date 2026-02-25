'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MATCH_DATA = {
  id: 1,
  team1: 'Team A',
  team2: 'Team B',
  score1: 178,
  score2: 165,
  overs1: '20.0',
  overs2: '19.2',
  status: 'completed',
  venue: 'Main Ground',
  date: '2024-02-01',
  toss: 'Team A won the toss and elected to bat',
  winner: 'Team A',
  margin: '13 runs',
};

const BATTING_STATS_TEAM1 = [
  { id: 1, name: 'Virat Kohli', runs: 65, balls: 48, fours: 8, sixes: 1, sr: 135.4 },
  { id: 2, name: 'Rohit Sharma', runs: 45, balls: 32, fours: 5, sixes: 1, sr: 140.6 },
  { id: 3, name: 'Surya Kumar', runs: 34, balls: 24, fours: 4, sixes: 1, sr: 141.7 },
  { id: 4, name: 'Hardik Pandya', runs: 28, balls: 18, fours: 2, sixes: 2, sr: 155.6 },
  { id: 5, name: 'Other Players', runs: 6, balls: 15, fours: 0, sixes: 0, sr: 40.0 },
];

const BATTING_STATS_TEAM2 = [
  { id: 1, name: 'Steve Smith', runs: 52, balls: 41, fours: 6, sixes: 0, sr: 126.8 },
  { id: 2, name: 'David Warner', runs: 48, balls: 35, fours: 6, sixes: 1, sr: 137.1 },
  { id: 3, name: 'Glenn Maxwell', runs: 31, balls: 22, fours: 3, sixes: 1, sr: 140.9 },
  { id: 4, name: 'Marcus Stoinis', runs: 26, balls: 20, fours: 2, sixes: 1, sr: 130.0 },
  { id: 5, name: 'Other Players', runs: 8, balls: 18, fours: 0, sixes: 0, sr: 44.4 },
];

const BOWLING_STATS_TEAM1 = [
  { id: 1, name: 'Jasprit Bumrah', overs: 4, runs: 28, wickets: 2, dots: 12, sr: 24.0, economy: 7.0 },
  { id: 2, name: 'Ravichandran Ashwin', overs: 4, runs: 32, wickets: 1, dots: 14, sr: 32.0, economy: 8.0 },
  { id: 3, name: 'Arjun Tendulkar', overs: 2, runs: 18, wickets: 1, dots: 5, sr: 18.0, economy: 9.0 },
  { id: 4, name: 'Other Bowlers', overs: 6, runs: 57, wickets: 0, dots: 15, sr: 0, economy: 9.5 },
];

const BOWLING_STATS_TEAM2 = [
  { id: 1, name: 'Josh Hazlewood', overs: 4, runs: 35, wickets: 2, dots: 10, sr: 20.0, economy: 8.75 },
  { id: 2, name: 'Pat Cummins', overs: 4, runs: 38, wickets: 1, dots: 9, sr: 22.7, economy: 9.5 },
  { id: 3, name: 'Nathan Lyon', overs: 2, runs: 22, wickets: 0, dots: 8, sr: 0, economy: 11.0 },
  { id: 4, name: 'Other Bowlers', overs: 9.2, runs: 72, wickets: 1, dots: 22, sr: 56.0, economy: 7.7 },
];

export default function CricketMatchDetailPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="cricket" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section with Back Button */}
          <div className="bg-gradient-to-r from-green-500/10 to-transparent border-b border-border px-8 py-6">
            <Link href="/sport/cricket/live" className="flex items-center gap-2 text-green-500 hover:text-green-600 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Matches</span>
            </Link>
            
            {/* Match Score Display */}
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team1}</p>
                <p className="text-5xl font-bold text-green-500">{MATCH_DATA.score1}</p>
                <p className="text-sm text-muted-foreground font-medium">{MATCH_DATA.overs1} overs</p>
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
                <p className="text-sm text-muted-foreground font-medium">{MATCH_DATA.overs2} overs</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="space-y-6">
              <Card className="bg-card/50 border-border shadow-md">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-muted-foreground tracking-wide uppercase mb-3">Match Info</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Venue</span>
                          <span className="text-sm font-semibold text-foreground">{MATCH_DATA.venue}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">Date</span>
                          <span className="text-sm font-semibold text-foreground">{MATCH_DATA.date}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Winner</span>
                          <span className="text-sm font-semibold text-green-500">{MATCH_DATA.winner}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-muted-foreground tracking-wide uppercase mb-3">Toss</p>
                      <p className="text-sm text-foreground leading-relaxed">{MATCH_DATA.toss}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="batting-team1" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="batting-team1">Batting {MATCH_DATA.team1}</TabsTrigger>
                  <TabsTrigger value="batting-team2">Batting {MATCH_DATA.team2}</TabsTrigger>
                  <TabsTrigger value="bowling-team1">Bowling {MATCH_DATA.team1}</TabsTrigger>
                  <TabsTrigger value="bowling-team2">Bowling {MATCH_DATA.team2}</TabsTrigger>
                </TabsList>

                <TabsContent value="batting-team1">
                  <Card className="bg-card border-border mt-4">
                    <CardHeader>
                      <CardTitle>{MATCH_DATA.team1} - Batting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-2">Batter</th>
                              <th className="text-center py-2 px-2">Runs</th>
                              <th className="text-center py-2 px-2">Balls</th>
                              <th className="text-center py-2 px-2">4s</th>
                              <th className="text-center py-2 px-2">6s</th>
                              <th className="text-center py-2 px-2">SR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {BATTING_STATS_TEAM1.map((player) => (
                              <tr key={player.id} className="border-b border-border hover:bg-background/50">
                                <td className="py-3 px-2 font-semibold">{player.name}</td>
                                <td className="text-center py-3 px-2 font-bold text-green-500">{player.runs}</td>
                                <td className="text-center py-3 px-2">{player.balls}</td>
                                <td className="text-center py-3 px-2">{player.fours}</td>
                                <td className="text-center py-3 px-2 text-red-500">{player.sixes}</td>
                                <td className="text-center py-3 px-2">{player.sr}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="batting-team2">
                  <Card className="bg-card border-border mt-4">
                    <CardHeader>
                      <CardTitle>{MATCH_DATA.team2} - Batting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-2">Batter</th>
                              <th className="text-center py-2 px-2">Runs</th>
                              <th className="text-center py-2 px-2">Balls</th>
                              <th className="text-center py-2 px-2">4s</th>
                              <th className="text-center py-2 px-2">6s</th>
                              <th className="text-center py-2 px-2">SR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {BATTING_STATS_TEAM2.map((player) => (
                              <tr key={player.id} className="border-b border-border hover:bg-background/50">
                                <td className="py-3 px-2 font-semibold">{player.name}</td>
                                <td className="text-center py-3 px-2 font-bold text-green-500">{player.runs}</td>
                                <td className="text-center py-3 px-2">{player.balls}</td>
                                <td className="text-center py-3 px-2">{player.fours}</td>
                                <td className="text-center py-3 px-2 text-red-500">{player.sixes}</td>
                                <td className="text-center py-3 px-2">{player.sr}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bowling-team1">
                  <Card className="bg-card border-border mt-4">
                    <CardHeader>
                      <CardTitle>{MATCH_DATA.team1} - Bowling</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-2">Bowler</th>
                              <th className="text-center py-2 px-2">Overs</th>
                              <th className="text-center py-2 px-2">Runs</th>
                              <th className="text-center py-2 px-2">Wickets</th>
                              <th className="text-center py-2 px-2">Economy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {BOWLING_STATS_TEAM1.map((player) => (
                              <tr key={player.id} className="border-b border-border hover:bg-background/50">
                                <td className="py-3 px-2 font-semibold">{player.name}</td>
                                <td className="text-center py-3 px-2">{player.overs}</td>
                                <td className="text-center py-3 px-2">{player.runs}</td>
                                <td className="text-center py-3 px-2 font-bold text-purple-500">{player.wickets}</td>
                                <td className="text-center py-3 px-2">{player.economy}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bowling-team2">
                  <Card className="bg-card border-border mt-4">
                    <CardHeader>
                      <CardTitle>{MATCH_DATA.team2} - Bowling</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-2">Bowler</th>
                              <th className="text-center py-2 px-2">Overs</th>
                              <th className="text-center py-2 px-2">Runs</th>
                              <th className="text-center py-2 px-2">Wickets</th>
                              <th className="text-center py-2 px-2">Economy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {BOWLING_STATS_TEAM2.map((player) => (
                              <tr key={player.id} className="border-b border-border hover:bg-background/50">
                                <td className="py-3 px-2 font-semibold">{player.name}</td>
                                <td className="text-center py-3 px-2">{player.overs}</td>
                                <td className="text-center py-3 px-2">{player.runs}</td>
                                <td className="text-center py-3 px-2 font-bold text-purple-500">{player.wickets}</td>
                                <td className="text-center py-3 px-2">{player.economy}</td>
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
          </div>
        </main>
      </div>
    </div>
  );
}
