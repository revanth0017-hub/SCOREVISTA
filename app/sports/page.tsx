'use client';

import { Sidebar } from '@/components/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { getSportIds, getSportTheme } from '@/lib/sport-theme';

const sportCounts: Record<string, { matches: number; teams: number }> = {
  cricket: { matches: 3, teams: 6 },
  football: { matches: 2, teams: 4 },
  volleyball: { matches: 4, teams: 8 },
  basketball: { matches: 2, teams: 4 },
  kabaddi: { matches: 1, teams: 2 },
  shuttle: { matches: 2, teams: 4 },
  tennis: { matches: 1, teams: 2 },
};

export default function SportsPage() {
  const ids = getSportIds();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-auto">
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-5">
          <h1 className="text-2xl font-bold text-foreground">All Sports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Browse and track all available sports</p>
        </div>

        <div className="p-8 md:p-10 max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-1">Select a Sport</h2>
            <p className="text-muted-foreground">Click any sport to view live matches and details</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ids.map((id) => {
              const theme = getSportTheme(id);
              const counts = sportCounts[id] ?? { matches: 0, teams: 0 };
              return (
                <Link key={id} href={`/sport/${id}/live`} className="group block">
                  <Card className="h-full bg-card border-border overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:border-[var(--sport-primary)]/30 rounded-xl">
                    <div
                      className="h-1.5 transition-all duration-200 group-hover:h-2"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <CardContent className="pt-6 pb-6">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4"
                        style={{ backgroundColor: theme.primaryLight }}
                      >
                        {theme.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                        {id === 'cricket' && 'Track cricket matches and scores'}
                        {id === 'football' && 'Football leagues and tournaments'}
                        {id === 'volleyball' && 'Volleyball competitions'}
                        {id === 'basketball' && 'Basketball tournaments'}
                        {id === 'kabaddi' && 'Traditional kabaddi games'}
                        {id === 'shuttle' && 'Badminton matches'}
                        {id === 'tennis' && 'Tennis tournaments'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Matches</p>
                          <p className="text-lg font-semibold text-foreground">{counts.matches}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Teams</p>
                          <p className="text-lg font-semibold text-foreground">{counts.teams}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
