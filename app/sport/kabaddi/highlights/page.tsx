'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Flame } from 'lucide-react';
import { SportHighlightsList } from '@/components/sport-highlights-list';

export default function KabaddiHighlightsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="kabaddi" />
        <main className="flex-1 overflow-auto bg-background">
          <div className="bg-gradient-to-r from-pink-500/10 to-transparent border-b border-border px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Kabaddi</h1>
                <p className="text-sm text-muted-foreground mt-1">Watch match highlights and replays</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Flame className="w-8 h-8 text-red-500" />
                Match Highlights
              </h2>
              <p className="text-muted-foreground">Watch the best moments</p>
            </div>
            <SportHighlightsList sport="kabaddi" />
          </div>
        </main>
      </div>
    </div>
  );
}
