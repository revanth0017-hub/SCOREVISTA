'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { SportTeamsList } from '@/components/sport-teams-list';

const TEAMS = [
  { id: 1, name: 'Team A', players: 12, wins: 8, losses: 2 },
  { id: 2, name: 'Team B', players: 12, wins: 6, losses: 4 },
  { id: 3, name: 'Team C', players: 12, wins: 5, losses: 5 },
];

export default function BasketballTeamsPage() {
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
                <p className="text-sm text-muted-foreground mt-1">Browse all basketball teams</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <SportTeamsList sportSlug="basketball" sportColor="#f97316" sportIcon="🏀" />
          </div>
        </main>
      </div>
    </div>
  );
}
