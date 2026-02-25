'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const PLAYERS = [
  { id: 1, name: 'Federer', country: 'Switzerland', ranking: 1, wins: 64 },
  { id: 2, name: 'Nadal', country: 'Spain', ranking: 2, wins: 61 },
  { id: 3, name: 'Djokovic', country: 'Serbia', ranking: 3, wins: 60 },
];

export default function TennisPlayersPage() {
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
                <p className="text-sm text-muted-foreground mt-1">Browse all tennis players</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Users className="w-6 h-6 text-yellow-500" />
                Top Players
              </h2>
              <p className="text-sm text-muted-foreground">Tennis player statistics</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLAYERS.map((player) => (
                <Card key={player.id} className="bg-card border-border hover:border-lime-600/50 transition">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-2">{player.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{player.country}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Ranking:</span>
                        <Badge className="bg-lime-600/20 text-lime-400">#{player.ranking}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Titles:</span>
                        <Badge className="bg-green-500/20 text-green-400">{player.wins}</Badge>
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
