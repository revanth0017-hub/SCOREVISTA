'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportPageHeader } from '@/components/sport-page-header';
import { LiveMatchCard } from '@/components/live-match-card';

const LIVE_MATCHES = [
  {
    id: '1',
    team1: 'Manchester United',
    team2: 'Liverpool',
    score1: '2',
    score2: '1',
    status: 'live',
    venue: 'Old Trafford',
    startTime: '45\' - HT',
  },
  {
    id: '2',
    team1: 'Arsenal',
    team2: 'Chelsea',
    score1: '1',
    score2: '0',
    status: 'live',
    venue: 'Emirates Stadium',
    startTime: '72\'',
  },
  {
    id: '3',
    team1: 'City FC',
    team2: 'Tottenham',
    score1: '0',
    score2: '0',
    status: 'upcoming',
    venue: 'Etihad Stadium',
    startTime: '8:00 PM',
  },
];

export default function FootballLivePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="football" />

        <main className="flex-1 overflow-auto bg-background">
          <SportPageHeader sportName="football" description="Track all football matches in real-time" />

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Live Matches</h2>
              <p className="text-muted-foreground text-sm">Track all football matches in real-time</p>
            </div>

            {/* Featured Live Match */}
            {LIVE_MATCHES[0] && (
              <LiveMatchCard match={LIVE_MATCHES[0]} sport="football" featured={true} />
            )}

            {/* All Matches Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">All Matches</h2>
              <p className="text-sm text-muted-foreground">View complete match schedule</p>
            </div>
            
            <div className="grid gap-4">
              {LIVE_MATCHES.map((match) => (
                <LiveMatchCard key={match.id} match={match} sport="football" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
