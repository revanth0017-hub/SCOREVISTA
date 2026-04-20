'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MATCH_DATA = {
  team1: 'Ace Players',
  score1: 3,
  team2: 'Serve Masters',
  score2: 1,
  venue: 'Tennis Court',
  date: '2024-02-01',
};

const SET_SCORES = [
  { set: 1, team1: 6, team2: 4 },
  { set: 2, team1: 6, team2: 3 },
  { set: 3, team1: 4, team2: 6 },
  { set: 4, team1: 6, team2: 2 },
];

export default function TennisMatchDetailPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="tennis" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section with Score Display */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center justify-center gap-8 py-4">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">{MATCH_DATA.team1}</p>
                <p className="text-5xl md:text-6xl font-bold text-yellow-500">{MATCH_DATA.score1}</p>
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
                <CardTitle>Set Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SET_SCORES.map((set) => (
                  <div key={set.set} className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <span className="font-semibold">Set {set.set}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{set.team1}</span>
                      <span>-</span>
                      <span className="font-bold">{set.team2}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
