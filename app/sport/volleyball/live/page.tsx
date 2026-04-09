'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportPageHeader } from '@/components/sport-page-header';
import { SportMatchesList } from '@/components/sport-matches-list';

export default function VolleyballLivePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="volleyball" />

        <main className="flex-1 overflow-auto bg-background">
          <SportPageHeader sportName="volleyball" description="Track all volleyball matches in real-time" />

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Live Matches</h2>
              <p className="text-muted-foreground text-sm">Track all volleyball matches in real-time</p>
            </div>

            <SportMatchesList sport="volleyball" />
          </div>
        </main>
      </div>
    </div>
  );
}
