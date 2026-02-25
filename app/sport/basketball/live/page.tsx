'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportPageHeader } from '@/components/sport-page-header';
import { LiveMatchCard } from '@/components/live-match-card';

const LIVE_MATCHES = [
  {
    id: '1',
    team1: 'Lakers',
    team2: 'Celtics',
    score1: '58',
    score2: '52',
    status: 'live',
    venue: 'Crypto.com Arena',
    startTime: 'Q3 - 5:32',
  },
  {
    id: '2',
    team1: 'Warriors',
    team2: 'Suns',
    score1: '68',
    score2: '64',
    status: 'live',
    venue: 'Chase Center',
    startTime: 'Q2 - 2:15',
  },
  {
    id: '3',
    team1: 'Heat',
    team2: 'Nets',
    score1: '0',
    score2: '0',
    status: 'upcoming',
    venue: 'FTX Arena',
    startTime: '9:00 PM',
  },
];

export default function BasketballLivePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="basketball" />

        <main className="flex-1 overflow-auto bg-background">
          <SportPageHeader sportName="basketball" description="Track all basketball matches in real-time" />

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Live Matches</h2>
              <p className="text-muted-foreground text-sm">Track all basketball matches in real-time</p>
            </div>

            {/* Featured Live Match */}
            {LIVE_MATCHES[0] && (
              <LiveMatchCard match={LIVE_MATCHES[0]} sport="basketball" featured={true} />
            )}

            {/* All Matches Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">All Matches</h2>
              <p className="text-sm text-muted-foreground">View complete match schedule</p>
            </div>
            
            <div className="grid gap-4">
              {LIVE_MATCHES.map((match) => (
                <LiveMatchCard key={match.id} match={match} sport="basketball" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
