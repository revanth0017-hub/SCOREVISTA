'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useTeams, type TeamData } from '@/hooks/use-teams';

interface SportTeamsListProps {
  sportSlug: string;
  sportColor: string;
  sportIcon: string;
}

/**
 * Sport Dynamic Teams List Component
 * Displays teams for selected sport with player information
 * Fetches from API and updates in real-time
 */
export function SportTeamsList({ sportSlug, sportColor, sportIcon }: SportTeamsListProps) {
  const [sportId, setSportId] = useState<string | null>(null);
  const { teams, isLoading, error } = useTeams(sportId);

  // Fetch sport ID on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ success: boolean; data: Array<{ _id: string; slug: string }> }>(
          `/api/sports`
        );
        const sports = (res as { data?: Array<{ _id: string; slug: string }> }).data || [];
        const sport = sports.find((s) => s.slug === sportSlug);
        if (!cancelled && sport) {
          setSportId(sport._id);
        }
      } catch (err) {
        console.error('Failed to fetch sport:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sportSlug]);

  if (!sportId && !error) {
    return (
      <div className="flex items-center justify-center gap-2 py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading teams...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Failed to load teams: {error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Users className="w-6 h-6" style={{ color: sportColor }} />
        Teams
      </h2>
      <p className="text-sm text-muted-foreground">View team statistics and information</p>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading teams...</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No teams available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {teams.map((team) => (
            <Card
              key={team._id}
              className="bg-card border-border hover:border-opacity-100 transition"
              style={{
                borderColor: sportColor,
                borderOpacity: 0.3,
              }}
            >
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">{team.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Players:</span>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: `${sportColor}20`,
                        color: sportColor,
                      }}
                    >
                      {team.players}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Wins:</span>
                    <Badge variant="secondary" className="text-green-500 bg-green-500/20">
                      {team.wins || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Losses:</span>
                    <Badge variant="secondary" className="text-red-500 bg-red-500/20">
                      {team.losses || 0}
                    </Badge>
                  </div>
                  {team.captain && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Captain:</span>
                      <span className="font-semibold text-foreground">{team.captain}</span>
                    </div>
                  )}

                  {/* Display Player List if available */}
                  {team.playerList && team.playerList.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Squad:</p>
                      <div className="space-y-1">
                        {team.playerList.map((player, idx) => (
                          <div key={idx} className="text-xs flex items-center justify-between">
                            <span className="font-medium">{player.name}</span>
                            {player.number && (
                              <Badge variant="outline" className="text-xs">
                                #{player.number}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
