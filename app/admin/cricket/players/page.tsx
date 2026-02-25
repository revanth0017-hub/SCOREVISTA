'use client';
import { usePathname } from 'next/navigation';import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';

import { AdminShell } from '@/components/admin-shell';
import { AdminPageHeader } from '@/components/admin-page-header';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

const PLAYERS = [
  { id: 1, name: 'Virat Kohli', team: 'Team A', role: 'Batter', jerseyNo: 18, runs: 145, avg: 48.3 },
  { id: 2, name: 'Jasprit Bumrah', team: 'Team A', role: 'Bowler', jerseyNo: 93, runs: 2, wickets: 12 },
  { id: 3, name: 'Rohit Sharma', team: 'Team B', role: 'Batter', jerseyNo: 45, runs: 156, avg: 52.0 },
  { id: 4, name: 'Ravichandran Ashwin', team: 'Team B', role: 'Bowler', jerseyNo: 37, runs: 5, wickets: 8 },
  { id: 5, name: 'KL Rahul', team: 'Team C', role: 'Keeper', jerseyNo: 1, runs: 98, avg: 45.5 },
  { id: 6, name: 'Siraj Khan', team: 'Team C', role: 'Bowler', jerseyNo: 15, runs: 1, wickets: 10 },
];

export default function CricketPlayersPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'cricket';
  const sportEmoji = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminPageHeader
          icon={sportEmoji}
          title="Cricket Players"
          description="Manage player profiles"
          buttonLabel="Add Player"
        />

        <div className="p-8 space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Players Directory</h2>
            <p className="text-muted-foreground">Add and manage player information</p>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Team</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Jersey</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Stats</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAYERS.map((player) => (
                    <tr key={player.id} className="border-b border-border hover:bg-background/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{player.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-500/20 text-blue-400">{player.team}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            player.role === 'Batter'
                              ? 'bg-green-500/20 text-green-400'
                              : player.role === 'Bowler'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-purple-500/20 text-purple-400'
                          }
                        >
                          {player.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">#{player.jerseyNo}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {player.role === 'Batter' && `${player.runs} runs @ ${player.avg}`}
                        {player.role === 'Bowler' && `${player.wickets} wickets`}
                        {player.role === 'Keeper' && `${player.runs} runs`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
