'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportPageHeader } from '@/components/sport-page-header';
import { LiveMatchCard } from '@/components/live-match-card';

const LIVE_MATCHES = [
  {
    id: '1',
    team1: 'Bengal Tigers',
    team2: 'Tamil Nadu',
    score1: '28',
    score2: '24',
    status: 'live',
    venue: 'Kolkata Stadium',
    startTime: 'HT - 15 mins',
  },
  {
    id: '2',
    team1: 'UP Yoddhas',
    team2: 'Gujarat Giants',
    score1: '35',
    score2: '32',
    status: 'live',
    venue: 'Delhi Stadium',
    startTime: '32 mins',
  },
  {
    id: '3',
    team1: 'Haryana Steelers',
    team2: 'Jaipur Pink Panthers',
    score1: '0',
    score2: '0',
    status: 'upcoming',
    venue: 'Chandigarh Stadium',
    startTime: '6:00 PM',
  },
];

export default function KabaddiLivePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="kabaddi" />

        <main className="flex-1 overflow-auto bg-background">
          <SportPageHeader sportName="kabaddi" description="Track all kabaddi matches in real-time" />

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Live Matches</h2>
              <p className="text-muted-foreground text-sm">Track all kabaddi matches in real-time</p>
            </div>

            {/* Featured Live Match */}
            {LIVE_MATCHES[0] && (
              <LiveMatchCard match={LIVE_MATCHES[0]} sport="kabaddi" featured={true} />
            )}

            {/* All Matches Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">All Matches</h2>
              <p className="text-sm text-muted-foreground">View complete match schedule</p>
            </div>
            
            <div className="grid gap-4">
              {LIVE_MATCHES.map((match) => (
                <LiveMatchCard key={match.id} match={match} sport="kabaddi" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
                <p className="text-xs text-muted-foreground">Live Scores</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Live Matches</h2>
              <p className="text-muted-foreground">Track all kabaddi matches in real-time</p>
            </div>

            <div className="space-y-4">
              {LIVE_MATCHES.map((match) => (
                <Card key={match.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusColors[match.status as keyof typeof statusColors]} text-white`}>
                          {match.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-semibold">{match.venue}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{match.half}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">{match.team1}</p>
                        <div className="text-4xl font-bold text-red-400">{match.score1}</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <p className="text-lg font-semibold text-muted-foreground">vs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">{match.team2}</p>
                        <div className="text-4xl font-bold text-blue-400">{match.score2}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
