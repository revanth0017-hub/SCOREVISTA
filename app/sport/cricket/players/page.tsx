'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const PLAYERS = [
  { id: 1, name: 'Virat Kohli', team: 'India', runs: 13848, avg: 54.2 },
  { id: 2, name: 'Steve Smith', team: 'Australia', runs: 12773, avg: 51.9 },
  { id: 3, name: 'Joe Root', team: 'England', runs: 11692, avg: 48.1 },
];

export default function CricketPlayersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="cricket" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                <span className="text-3xl">🏏</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Cricket</h1>
                <p className="text-sm text-muted-foreground mt-1">Browse all cricket players</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-500" />
                Top Players
              </h2>
              <p className="text-sm text-muted-foreground">Cricket player statistics</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLAYERS.map((player) => (
                <Card key={player.id} className="bg-card border-border hover:border-green-600/50 transition">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-2">{player.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{player.team}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Runs:</span>
                        <Badge className="bg-green-500/20 text-green-400">{player.runs}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average:</span>
                        <Badge className="bg-blue-500/20 text-blue-400">{player.avg}</Badge>
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
