'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const TEAMS = [
  { id: 1, name: 'Waves', players: 14, wins: 7, losses: 2 },
  { id: 2, name: 'Thunder', players: 14, wins: 6, losses: 3 },
  { id: 3, name: 'Eagles', players: 14, wins: 5, losses: 4 },
];

export default function VolleyballTeamsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="volleyball" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="text-3xl">🏐</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Volleyball</h1>
                <p className="text-sm text-muted-foreground mt-1">Browse all volleyball teams</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Users className="w-6 h-6 text-red-500" />
                Teams
              </h2>
              <p className="text-sm text-muted-foreground">View team statistics and information</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEAMS.map((team) => (
                <Card key={team.id} className="bg-card border-border hover:border-orange-500/50 transition">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-4">{team.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Players:</span>
                        <Badge className="bg-blue-500/20 text-blue-400">{team.players}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Wins:</span>
                        <Badge className="bg-green-500/20 text-green-400">{team.wins}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Losses:</span>
                        <Badge className="bg-red-500/20 text-red-400">{team.losses}</Badge>
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
