'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FIXTURES = [
  { id: 1, team1: 'Manchester United', team2: 'Liverpool', date: '2024-02-15 19:00', venue: 'Old Trafford' },
  { id: 2, team1: 'Arsenal', team2: 'Chelsea', date: '2024-02-16 15:00', venue: 'Emirates Stadium' },
  { id: 3, team1: 'City FC', team2: 'Tottenham', date: '2024-02-17 20:00', venue: 'Etihad Stadium' },
];

export default function FootballFixturesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopNav sportName="football" />
        <main className="flex-1 overflow-auto bg-background">
          <div className="bg-card border-b border-border sticky top-12 z-10 px-8 py-4">
            <h1 className="text-2xl font-bold">⚽ Fixtures</h1>
          </div>
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Upcoming Fixtures</h2>
            <div className="space-y-4">
              {FIXTURES.map((fixture) => (
                <Card key={fixture.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{fixture.team1} vs {fixture.team2}</p>
                        <p className="text-sm text-muted-foreground mt-1">{fixture.venue}</p>
                      </div>
                      <Badge variant="outline">{fixture.date}</Badge>
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
