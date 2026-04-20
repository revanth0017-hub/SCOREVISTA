'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { usePlayers, type PlayerData } from '@/hooks/use-players';
import { getSocket } from '@/lib/socket';

interface LiveScoreboardProps {
  matchId: string;
  sportSlug: string;
  teamAId: string;
  teamBId: string;
  sportId: string;
}

/**
 * Live Scoreboard Component
 * Displays real-time individual player stats for the current match
 * Supports all sports with player-specific statistics
 */
export function LiveScoreboard({
  matchId,
  sportSlug,
  teamAId,
  teamBId,
  sportId,
}: LiveScoreboardProps) {
  const { players, isLoading } = usePlayers(sportId);
  const [playerStats, setPlayerStats] = useState<Map<string, PlayerData>>(new Map());

  // Filter players by team
  const teamAPlayers = players.filter((p) => p.team._id === teamAId);
  const teamBPlayers = players.filter((p) => p.team._id === teamBId);

  useEffect(() => {
    // Create map for quick access
    const statsMap = new Map(players.map((p) => [p._id, p]));
    setPlayerStats(statsMap);
  }, [players]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for player stat updates
    const handlePlayerStatsUpdate = (data: any) => {
      if (data.matchId === matchId) {
        setPlayerStats((prev) => new Map(prev));// Force re-render
      }
    };

    socket.on('playerStatsUpdated', handlePlayerStatsUpdate);
    socket.on('scoreUpdated', handlePlayerStatsUpdate);

    return () => {
      socket.off('playerStatsUpdated', handlePlayerStatsUpdate);
      socket.off('scoreUpdated', handlePlayerStatsUpdate);
    };
  }, [matchId]);

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading player stats...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderPlayerStatsRow = (player: PlayerData) => {
    const stats = player.stats;
    switch (sportSlug) {
      case 'cricket':
        return (
          <tr key={player._id} className="border-b border-border">
            <td className="py-3 px-2 font-semibold">{player.name}</td>
            <td className="text-center py-3 px-2 text-xs">{player.role || '-'}</td>
            <td className="text-center py-3 px-2 font-bold text-green-500">{stats.runs || 0}</td>
            <td className="text-center py-3 px-2 text-red-500">{stats.wickets || 0}</td>
          </tr>
        );
      case 'football':
        return (
          <tr key={player._id} className="border-b border-border">
            <td className="py-3 px-2 font-semibold">{player.name}</td>
            <td className="text-center py-3 px-2 text-xs">{player.role || '-'}</td>
            <td className="text-center py-3 px-2 font-bold text-blue-500">{stats.goals || 0}</td>
            <td className="text-center py-3 px-2 text-purple-500">{stats.assists || 0}</td>
          </tr>
        );
      case 'basketball':
        return (
          <tr key={player._id} className="border-b border-border">
            <td className="py-3 px-2 font-semibold">{player.name}</td>
            <td className="text-center py-3 px-2 text-xs">{player.role || '-'}</td>
            <td className="text-center py-3 px-2 font-bold text-orange-500">{stats.points || 0}</td>
            <td className="text-center py-3 px-2">{stats.assists || 0}</td>
          </tr>
        );
      case 'volleyball':
        return (
          <tr key={player._id} className="border-b border-border">
            <td className="py-3 px-2 font-semibold">{player.name}</td>
            <td className="text-center py-3 px-2 text-xs">{player.role || '-'}</td>
            <td className="text-center py-3 px-2 font-bold text-red-500">{stats.points || 0}</td>
            <td className="text-center py-3 px-2">{stats.aces || 0}</td>
          </tr>
        );
      case 'kabaddi':
        return (
          <tr key={player._id} className="border-b border-border">
            <td className="py-3 px-2 font-semibold">{player.name}</td>
            <td className="text-center py-3 px-2 text-xs">{player.role || '-'}</td>
            <td className="text-center py-3 px-2 font-bold text-pink-500">{stats.raids || 0}</td>
            <td className="text-center py-3 px-2">{stats.tackles || 0}</td>
          </tr>
        );
      case 'shuttle':
      case 'badminton':
        return (
          <tr key={player._id} className="border-b border-border">
            <td className="py-3 px-2 font-semibold">{player.name}</td>
            <td className="text-center py-3 px-2 text-xs">{player.role || '-'}</td>
            <td className="text-center py-3 px-2 font-bold text-teal-500">{stats.points || 0}</td>
            <td className="text-center py-3 px-2">{stats.aces || 0}</td>
          </tr>
        );
      case 'tennis':
        return (
          <tr key={player._id} className="border-b border-border">
            <td className="py-3 px-2 font-semibold">{player.name}</td>
            <td className="text-center py-3 px-2 text-xs">{player.role || '-'}</td>
            <td className="text-center py-3 px-2 font-bold text-yellow-500">{stats.points || 0}</td>
            <td className="text-center py-3 px-2">{(stats.sets || []).length}</td>
          </tr>
        );
      default:
        return (
          <tr key={player._id} className="border-b border-border">
            <td className="py-3 px-2 font-semibold">{player.name}</td>
            <td className="text-center py-3 px-2 text-xs">{player.role || '-'}</td>
            <td className="text-center py-3 px-2 font-bold text-green-500">{stats.points || 0}</td>
            <td className="text-center py-3 px-2">-</td>
          </tr>
        );
    }
  };

  const getHeader = () => {
    switch (sportSlug) {
      case 'cricket':
        return <th className="text-center py-2 px-2">Runs</th> && <th className="text-center py-2 px-2">Wickets</th>;
      case 'football':
        return <th className="text-center py-2 px-2">Goals</th> && <th className="text-center py-2 px-2">Assists</th>;
      case 'basketball':
        return <th className="text-center py-2 px-2">Points</th> && <th className="text-center py-2 px-2">Assists</th>;
      case 'volleyball':
        return <th className="text-center py-2 px-2">Points</th> && <th className="text-center py-2 px-2">Aces</th>;
      case 'kabaddi':
        return <th className="text-center py-2 px-2">Raids</th> && <th className="text-center py-2 px-2">Tackles</th>;
      default:
        return <th className="text-center py-2 px-2">Points</th> && <th className="text-center py-2 px-2">Extra</th>;
    }
  };

  const getHeader2 = () => {
    switch (sportSlug) {
      case 'cricket':
        return 'Stat 2';
      case 'football':
        return 'Assists';
      case 'basketball':
        return 'Assists';
      case 'volleyball':
        return 'Aces';
      case 'kabaddi':
        return 'Tackles';
      default:
        return 'Extra';
    }
  };

  return (
    <div className="space-y-6">
      {/* Team A */}
      {teamAPlayers.length > 0 && (
        <Card className="bg-card/50 border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Team A Players</span>
              <Badge variant="outline">{teamAPlayers.length} Players</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">Player</th>
                    <th className="text-center py-2 px-2">Role</th>
                    {getHeader()}
                  </tr>
                </thead>
                <tbody>{teamAPlayers.map((p) => renderPlayerStatsRow(p))}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team B */}
      {teamBPlayers.length > 0 && (
        <Card className="bg-card/50 border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Team B Players</span>
              <Badge variant="outline">{teamBPlayers.length} Players</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">Player</th>
                    <th className="text-center py-2 px-2">Role</th>
                    {getHeader()}
                  </tr>
                </thead>
                <tbody>{teamBPlayers.map((p) => renderPlayerStatsRow(p))}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {players.length === 0 && !isLoading && (
        <Card className="bg-card/50 border-border shadow-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No players found. Please assign players to teams first.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
