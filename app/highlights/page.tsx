'use client';

import { Sidebar } from '@/components/sidebar';
import { Flame } from 'lucide-react';
import { AllHighlightsList } from '@/components/all-highlights-list';

export default function HighlightsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-6">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold">Highlights</h1>
              <p className="text-muted-foreground">Watch the most exciting moments from all sports</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AllHighlightsList />
        </div>
      </main>
    </div>
  );
}
