'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportTeamsList } from '@/components/sport-teams-list';

export default function KabaddiTeamsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="kabaddi" />
        <main className="flex-1 overflow-auto bg-background">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-pink-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Kabaddi</h1>
                <p className="text-sm text-muted-foreground mt-1">Browse all kabaddi teams</p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <SportTeamsList sportSlug="kabaddi" sportColor="#ec4899" sportIcon="👥" />
          </div>
        </main>
      </div>
    </div>
  );
}
