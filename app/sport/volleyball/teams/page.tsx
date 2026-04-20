'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportTeamsList } from '@/components/sport-teams-list';

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
            <SportTeamsList sportSlug="volleyball" sportColor="#ef4444" sportIcon="🏐" />
          </div>
        </main>
      </div>
    </div>
  );
}
