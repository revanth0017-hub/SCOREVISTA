'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { SportPageHeader } from '@/components/sport-page-header';
import { LiveMatchCard } from '@/components/live-match-card';

const LIVE_MATCHES = [
  {
    id: '1',
    team1: 'Saina Nehwal',
    team2: 'PV Sindhu',
    score1: '21',
    score2: '18',
    status: 'live',
    venue: 'Aakash Stadium',
    startTime: 'Set 2 - 8:5',
  },
  {
    id: '2',
    team1: 'Kidambi Srikanth',
    team2: 'Sai Praneeth',
    score1: '15',
    score2: '12',
    status: 'live',
    venue: 'Delhi Sports Complex',
    startTime: 'Set 1 - 15:12',
  },
  {
    id: '3',
    team1: 'Treesa Jolly',
    team2: 'Ashwini Ponnappa',
    score1: '0',
    score2: '0',
    status: 'upcoming',
    venue: 'Chennai Stadium',
    startTime: '5:30 PM',
  },
];

export default function ShuttleLivePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="shuttle" />

        <main className="flex-1 overflow-auto bg-background">
          <SportPageHeader sportName="shuttle" title="Badminton" description="Track all badminton matches in real-time" />

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Live Matches</h2>
              <p className="text-muted-foreground text-sm">Track all badminton matches in real-time</p>
            </div>

            {/* Featured Live Match */}
            {LIVE_MATCHES[0] && (
              <LiveMatchCard match={LIVE_MATCHES[0]} sport="shuttle" featured={true} />
            )}

            {/* All Matches Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">All Matches</h2>
              <p className="text-sm text-muted-foreground">View complete match schedule</p>
            </div>
            
            <div className="grid gap-4">
              {LIVE_MATCHES.map((match) => (
                <LiveMatchCard key={match.id} match={match} sport="shuttle" />
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
              <p className="text-muted-foreground">Track all badminton matches in real-time</p>
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
                      <span className="text-sm text-muted-foreground">{match.set}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">{match.team1}</p>
                        <div className="text-4xl font-bold text-cyan-400">{match.score1}</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <p className="text-lg font-semibold text-muted-foreground">vs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">{match.team2}</p>
                        <div className="text-4xl font-bold text-pink-400">{match.score2}</div>
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
