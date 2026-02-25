'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportPageHeader } from '@/components/sport-page-header';
import { LiveMatchCard } from '@/components/live-match-card';

const LIVE_MATCHES = [
  {
    id: '1',
    team1: 'Team X',
    team2: 'Team Y',
    score1: '2',
    score2: '1',
    status: 'live',
    venue: 'Sports Complex',
    startTime: 'Set 3 - 22:18',
  },
  {
    id: '2',
    team1: 'Eagles',
    team2: 'Tigers',
    score1: '1',
    score2: '1',
    status: 'live',
    venue: 'Central Court',
    startTime: 'Set 2 - 15:12',
  },
  {
    id: '3',
    team1: 'Dragons',
    team2: 'Phoenix',
    score1: '0',
    score2: '0',
    status: 'upcoming',
    venue: 'North Court',
    startTime: '7:00 PM',
  },
];

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

            {/* Featured Live Match */}
            {LIVE_MATCHES[0] && (
              <LiveMatchCard match={LIVE_MATCHES[0]} sport="volleyball" featured={true} />
            )}

            {/* All Matches Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">All Matches</h2>
              <p className="text-sm text-muted-foreground">View complete match schedule</p>
            </div>
            
            <div className="grid gap-4">
              {LIVE_MATCHES.map((match) => (
                <LiveMatchCard key={match.id} match={match} sport="volleyball" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
