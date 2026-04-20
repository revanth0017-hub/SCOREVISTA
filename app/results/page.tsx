'use client';

import { Sidebar } from '@/components/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useMatchResults } from '@/hooks/use-match-results';

const SPORT_COLORS: Record<string, string> = {
  cricket: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  football: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  volleyball: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  basketball: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  kabaddi: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  shuttle: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  tennis: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
};

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

export default function ResultsPage() {
  const { results, loading, error, refetch } = useMatchResults();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getWinner = (match: any) => {
    if (!match) return null;
    const { scoreA, scoreB, teamA, teamB } = match;
    if (scoreA === undefined || scoreB === undefined) return null;
    if (scoreA > scoreB) return teamA?.name;
    if (scoreB > scoreA) return teamB?.name;
    return null;
  };

  const formatSportSlug = (slug: string) => {
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Top bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Match Results</h1>
              <p className="text-xs text-muted-foreground">Completed matches and final scores</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Trophy className="w-8 h-8 text-amber-500" />
              Match Results
            </h2>
            <p className="text-muted-foreground">View all completed matches and winners</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Loading results...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="bg-destructive/10 border-destructive/20 mb-6">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results State */}
          {!loading && !error && results.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="pt-12 pb-12 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2">No completed matches yet</p>
                <p className="text-sm text-muted-foreground">
                  Completed matches will appear here as matches finish
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results List */}
          {!loading && !error && results.length > 0 && (
            <div className="space-y-4">
              {results.map((match) => {
                const sportSlug = (match.sport?.slug || '').toLowerCase();
                const sportColor = SPORT_COLORS[sportSlug] || 'bg-slate-500/15 text-slate-700';
                const sportEmoji = SPORT_EMOJI[sportSlug] || '🏆';
                const winner = getWinner(match);

                return (
                  <Card
                    key={match._id}
                    className="bg-card border-border hover:shadow-lg transition"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <Badge className="bg-green-500 text-white whitespace-nowrap">COMPLETED</Badge>
                            <Badge className={`${sportColor} border-0 whitespace-nowrap`}>
                              {sportEmoji} {formatSportSlug(sportSlug)}
                            </Badge>
                            {match.date && (
                              <>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {formatDate(match.date)}
                                </span>
                              </>
                            )}
                            {match.venue && (
                              <>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground truncate">
                                  {match.venue}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 md:gap-8">
                            <div
                              className={
                                winner === match.teamA?.name ? 'opacity-100' : 'opacity-60'
                              }
                            >
                              <p className="text-sm font-semibold mb-1 flex items-center gap-2 truncate">
                                <span className="truncate">{match.teamA?.name || 'Team A'}</span>
                                {winner === match.teamA?.name && (
                                  <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
                                )}
                              </p>
                              <p className="text-2xl md:text-3xl font-bold text-foreground">
                                {match.scoreA ?? '-'}
                              </p>
                            </div>

                            <div className="flex items-center justify-center">
                              <span className="text-muted-foreground font-medium">vs</span>
                            </div>

                            <div
                              className={
                                'text-right ' +
                                (winner === match.teamB?.name ? 'opacity-100' : 'opacity-60')
                              }
                            >
                              <p className="text-sm font-semibold mb-1 flex items-center justify-end gap-2 truncate">
                                {winner === match.teamB?.name && (
                                  <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />
                                )}
                                <span className="truncate">{match.teamB?.name || 'Team B'}</span>
                              </p>
                              <p className="text-2xl md:text-3xl font-bold text-foreground">
                                {match.scoreB ?? '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
