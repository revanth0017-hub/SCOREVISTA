'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportPageHeader } from '@/components/sport-page-header';
import { LiveMatchCard } from '@/components/live-match-card';

const LIVE_MATCHES = [
  {
    id: '1',
    team1: 'Team A',
    team2: 'Team B',
    score1: '142',
    score2: '89',
    overs1: '15.3',
    overs2: '12.0',
    status: 'live',
    venue: 'Main Ground',
    startTime: '2:00 PM',
  },
  {
    id: '2',
    team1: 'Team C',
    team2: 'Team D',
    score1: '178',
    score2: '165',
    overs1: '20.0',
    overs2: '19.2',
    status: 'completed',
    venue: 'Secondary Ground',
    startTime: '10:00 AM',
  },
  {
    id: '3',
    team1: 'Team E',
    team2: 'Team F',
    score1: '0',
    score2: '0',
    overs1: '0.0',
    overs2: '0.0',
    status: 'upcoming',
    venue: 'Main Ground',
    startTime: '6:00 PM',
  },
];

const statusColors = {
  live: 'bg-red-500',
  completed: 'bg-green-500',
  upcoming: 'bg-amber-500',
};

export default function CricketLivePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="cricket" />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
          <SportPageHeader sportName="cricket" description="Track all cricket matches in real-time" />

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Live Matches</h2>
              <p className="text-muted-foreground text-sm">Track all cricket matches in real-time</p>
            </div>

            {/* Featured Live Match */}
            {LIVE_MATCHES[0] && (
              <LiveMatchCard match={LIVE_MATCHES[0]} sport="cricket" featured={true} />
            )}

            {/* All Matches Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">All Matches</h2>
              <p className="text-sm text-muted-foreground">View complete match schedule</p>
            </div>
            
            <div className="grid gap-4">
              {LIVE_MATCHES.map((match) => (
                <LiveMatchCard key={match.id} match={match} sport="cricket" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
