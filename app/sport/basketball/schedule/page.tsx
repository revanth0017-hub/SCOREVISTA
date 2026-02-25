'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

const UPCOMING_MATCHES = [
  {
    id: 1,
    team1: 'Team A',
    team2: 'Team B',
    date: '2024-02-15',
    time: '7:00 PM',
    venue: 'Main Arena',
  },
  {
    id: 2,
    team1: 'Team C',
    team2: 'Team D',
    date: '2024-02-16',
    time: '6:00 PM',
    venue: 'Secondary Arena',
  },
  {
    id: 3,
    team1: 'Team E',
    team2: 'Team F',
    date: '2024-02-17',
    time: '8:00 PM',
    venue: 'Main Arena',
  },
];

export default function BasketballSchedulePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="basketball" />

        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <span className="text-3xl">🏀</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Basketball</h1>
                <p className="text-sm text-muted-foreground mt-1">View all scheduled basketball matches</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-500" />
                Upcoming Matches
              </h2>
              <p className="text-sm text-muted-foreground">Complete schedule and fixtures</p>
            </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Calendar className="w-8 h-8 text-orange-500" />
                Upcoming Matches
              </h2>
              <p className="text-muted-foreground">View all scheduled basketball matches</p>
            </div>

            <div className="space-y-4">
              {UPCOMING_MATCHES.map((match) => (
                <Card key={match.id} className="bg-card border-border hover:border-orange-500/50 transition">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-orange-500/20 text-orange-400">
                            {match.date}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{match.time}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div>
                            <p className="font-semibold">{match.team1}</p>
                          </div>
                          <div className="text-center text-muted-foreground">vs</div>
                          <div className="text-right">
                            <p className="font-semibold">{match.team2}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{match.venue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
