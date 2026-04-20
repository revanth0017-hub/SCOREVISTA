'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from 'lucide-react';
import { EventScoreForm } from '@/components/event-score-form';
import { AdminShell } from '@/components/admin-shell';
import { AdminPageHeader } from '@/components/admin-page-header';
import { api } from '@/lib/api';
import { messageIfWorthShowing } from '@/lib/client-errors';

interface MatchDetail {
  _id: string;
  sport: { _id: string; slug: string; name: string };
  teamA: { _id: string; name: string };
  teamB: { _id: string; name: string };
  date: string;
  time: string;
  venue: string;
  status: string;
  scoreA: number;
  scoreB: number;
  sportScore: Record<string, any>;
}

interface Player {
  _id: string;
  name: string;
  number?: number;
  role?: string;
  stats: Record<string, any>;
}

interface MatchPlayerStats {
  match: { id: string; teamA: { _id: string; name: string }; teamB: { _id: string; name: string } };
  teamA: Player[];
  teamB: Player[];
}

interface AdminMatchScorePageProps {
  matchId: string;
  sportSlug: string;
  sportIcon: string;
}

export function AdminMatchScorePage({ matchId, sportSlug, sportIcon }: AdminMatchScorePageProps) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [playerStats, setPlayerStats] = useState<MatchPlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchAndStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [matchRes, statsRes] = await Promise.all([
        api.get<{ success: boolean; data: MatchDetail }>(`/api/matches/${matchId}`),
        api.get<{ success: boolean; data: MatchPlayerStats }>(`/api/matches/${matchId}/player-stats`),
      ]);

      setMatch((matchRes as any).data || null);
      setPlayerStats((statsRes as any).data || null);
    } catch (err) {
      const msg = messageIfWorthShowing(err);
      setError(msg || 'Failed to fetch match details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchAndStats();
  }, [matchId]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-full">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (error || !match) {
    return (
      <AdminShell>
        <div className="p-8">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-500">
            {error || 'Match not found'}
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminPageHeader
          icon={sportIcon}
          title={`${match.teamA.name} vs ${match.teamB.name}`}
          description={`${match.date} at ${match.venue}`}
        />

        <main className="flex-1 overflow-auto p-8 space-y-8">
          {/* Match Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                  <div className="text-lg font-semibold">{match.date} {match.time}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Venue</div>
                  <div className="text-lg font-semibold">{match.venue}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge
                    className={
                      match.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : match.status === 'live'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }
                  >
                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Score */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Current Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{match.scoreA}</div>
                  <div className="text-lg font-semibold">{match.teamA.name}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{match.scoreB}</div>
                  <div className="text-lg font-semibold">{match.teamB.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Score Form */}
          {playerStats && (
            <EventScoreForm
              matchId={matchId}
              sportSlug={sportSlug}
              teamAPlayers={playerStats.teamA}
              teamBPlayers={playerStats.teamB}
              teamAName={match.teamA.name}
              teamBName={match.teamB.name}
              onEventProcessed={fetchMatchAndStats}
            />
          )}

          {/* Player Stats */}
          {playerStats && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Team A Players */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{match.teamA.name} - Player Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {playerStats.teamA.map((player) => (
                      <div key={player._id} className="border border-border rounded-lg p-3">
                        <div className="font-semibold text-sm mb-2">
                          {player.number && `#${player.number}`} {player.name} {player.role && `(${player.role})`}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(player.stats).map(([key, value]) => (
                            value !== 0 && (
                              <div key={key}>
                                <span className="text-muted-foreground capitalize">{key}:</span>
                                <span className="font-semibold ml-1">{value}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team B Players */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{match.teamB.name} - Player Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {playerStats.teamB.map((player) => (
                      <div key={player._id} className="border border-border rounded-lg p-3">
                        <div className="font-semibold text-sm mb-2">
                          {player.number && `#${player.number}`} {player.name} {player.role && `(${player.role})`}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(player.stats).map(([key, value]) => (
                            value !== 0 && (
                              <div key={key}>
                                <span className="text-muted-foreground capitalize">{key}:</span>
                                <span className="font-semibold ml-1">{value}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </AdminShell>
  );
}
