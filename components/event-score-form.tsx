'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface Player {
  _id: string;
  name: string;
  number?: number;
  role?: string;
}

interface EventScoreFormProps {
  matchId: string;
  sportSlug: string;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  teamAName: string;
  teamBName: string;
  onEventProcessed?: () => void;
}

export function EventScoreForm({
  matchId,
  sportSlug,
  teamAPlayers,
  teamBPlayers,
  teamAName,
  teamBName,
  onEventProcessed,
}: EventScoreFormProps) {
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const currentPlayers = selectedTeam === 'A' ? teamAPlayers : teamBPlayers;
  const currentTeamName = selectedTeam === 'A' ? teamAName : teamBName;

  const processEvent = async (eventType: string, data?: Record<string, any>) => {
    if (!selectedPlayers.length && !data?.skipPlayers) {
      toast({ title: 'Error', description: 'Please select at least one player' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${matchId}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportSlug,
          eventType,
          playerIds: selectedPlayers,
          data: { ...data, team: selectedTeam },
        }),
      });

      if (!response.ok) throw new Error('Failed to process event');

      toast({ title: 'Success', description: 'Event recorded' });
      setSelectedPlayers([]);
      onEventProcessed?.();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to record event' });
    } finally {
      setLoading(false);
    }
  };

  const undoLastEvent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${matchId}/event-undo`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to undo event');
      toast({ title: 'Success', description: 'Event undone' });
      onEventProcessed?.();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to undo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Record Event - {sportSlug.toUpperCase()}</CardTitle>
        <CardDescription>Select team and players, then choose an event</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Selection */}
        <div className="flex gap-2">
          <Button
            variant={selectedTeam === 'A' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedTeam('A');
              setSelectedPlayers([]);
            }}
            disabled={loading}
          >
            {teamAName}
          </Button>
          <Button
            variant={selectedTeam === 'B' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedTeam('B');
              setSelectedPlayers([]);
            }}
            disabled={loading}
          >
            {teamBName}
          </Button>
        </div>

        {/* Player Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Players</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {currentPlayers.map((player) => (
              <Button
                key={player._id}
                variant={selectedPlayers.includes(player._id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedPlayers((prev) =>
                    prev.includes(player._id)
                      ? prev.filter((id) => id !== player._id)
                      : [...prev, player._id]
                  );
                }}
                disabled={loading}
              >
                {player.number && `#${player.number}`} {player.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Sport-Specific Event Buttons */}
        <div className="space-y-4">
          {sportSlug === 'cricket' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Cricket Events</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => processEvent('wicket')} disabled={loading}>
                  Wicket
                </Button>
                {[0, 1, 2, 3, 4, 6].map((runs) => (
                  <Button key={runs} onClick={() => processEvent('runs', { runs })} disabled={loading}>
                    {runs} Runs
                  </Button>
                ))}
                <Button onClick={() => processEvent('wide')} disabled={loading} variant="outline">
                  Wide
                </Button>
                <Button onClick={() => processEvent('noBall')} disabled={loading} variant="outline">
                  No Ball
                </Button>
                <Button onClick={() => processEvent('bye')} disabled={loading} variant="outline">
                  Bye
                </Button>
              </div>
            </div>
          )}

          {sportSlug === 'football' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Football Events</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className="bg-green-600"
                  onClick={() => processEvent('goal')}
                  disabled={loading}
                >
                  ⚽ Goal
                </Button>
                <Button
                  className="bg-blue-600"
                  onClick={() => processEvent('assist')}
                  disabled={loading}
                >
                  🎯 Assist
                </Button>
                <Button onClick={() => processEvent('yellow')} disabled={loading} variant="outline">
                  🟨 Yellow
                </Button>
                <Button onClick={() => processEvent('red')} disabled={loading} className="bg-red-600">
                  🟥 Red
                </Button>
                <Button onClick={() => processEvent('shot')} disabled={loading} variant="outline">
                  Shot
                </Button>
              </div>
            </div>
          )}

          {sportSlug === 'basketball' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Basketball Points</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className="bg-orange-600"
                  onClick={() => processEvent('1point')}
                  disabled={loading}
                >
                  1 Point
                </Button>
                <Button
                  className="bg-green-600"
                  onClick={() => processEvent('2point')}
                  disabled={loading}
                >
                  2 Points
                </Button>
                <Button
                  className="bg-purple-600"
                  onClick={() => processEvent('3point')}
                  disabled={loading}
                >
                  3 Points
                </Button>
                <Button onClick={() => processEvent('foul')} disabled={loading} variant="outline">
                  Foul
                </Button>
              </div>
            </div>
          )}

          {sportSlug === 'tennis' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Tennis Points</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className="bg-blue-600"
                  onClick={() => processEvent('point')}
                  disabled={loading}
                >
                  Point (0/15/30/40)
                </Button>
                <Button onClick={() => processEvent('deuce')} disabled={loading} variant="outline">
                  Deuce
                </Button>
                <Button onClick={() => processEvent('advantage')} disabled={loading} variant="outline">
                  Advantage
                </Button>
                <Button
                  className="bg-green-600"
                  onClick={() => processEvent('ace')}
                  disabled={loading}
                >
                  Ace
                </Button>
              </div>
            </div>
          )}

          {sportSlug === 'volleyball' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Volleyball Points</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className="bg-yellow-600"
                  onClick={() => processEvent('point')}
                  disabled={loading}
                >
                  Point
                </Button>
                <Button
                  className="bg-green-600"
                  onClick={() => processEvent('ace')}
                  disabled={loading}
                >
                  Ace
                </Button>
              </div>
            </div>
          )}

          {sportSlug === 'kabaddi' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Kabaddi Events</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className="bg-blue-600"
                  onClick={() => processEvent('point', { value: 1 })}
                  disabled={loading}
                >
                  1 Point
                </Button>
                <Button
                  className="bg-purple-600"
                  onClick={() => processEvent('point', { value: 2 })}
                  disabled={loading}
                >
                  2 Points
                </Button>
                <Button
                  className="bg-green-600"
                  onClick={() => processEvent('point', { value: 4 })}
                  disabled={loading}
                >
                  Bonus
                </Button>
                <Button onClick={() => processEvent('raid')} disabled={loading} variant="outline">
                  Raid
                </Button>
                <Button onClick={() => processEvent('tackle')} disabled={loading} variant="outline">
                  Tackle
                </Button>
              </div>
            </div>
          )}

          {sportSlug === 'shuttle' && (
            <div className="space-y-2">
              <h3 className="font-semibold">Badminton/Shuttle Points</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className="bg-blue-600"
                  onClick={() => processEvent('point')}
                  disabled={loading}
                >
                  Point
                </Button>
                <Button
                  className="bg-green-600"
                  onClick={() => processEvent('ace')}
                  disabled={loading}
                >
                  Ace
                </Button>
              </div>
            </div>
          )}

          {/* Undo Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={undoLastEvent}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              ↶ Undo Last Event
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
