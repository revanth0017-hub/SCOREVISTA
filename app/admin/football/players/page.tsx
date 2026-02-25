'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  { id: 1, name: 'Cristiano Ronaldo', team: 'Eagles', position: 'Forward', jerseyNo: 7, goals: 25, assists: 8 },
  { id: 2, name: 'Lionel Messi', team: 'Lions', position: 'Forward', jerseyNo: 10, goals: 28, assists: 10 },
  { id: 3, name: 'Luka Modric', team: 'Eagles', position: 'Midfielder', jerseyNo: 19, goals: 3, assists: 5 },
];

export default function FootballPlayersPage() {
  const sport = 'football';
  const sportEmoji = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminPageHeader
          icon={sportEmoji}
          title="Football Players"
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
                    <th className="px-6 py-3 text-left text-sm font-semibold">Position</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Jersey</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Goals</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Assists</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAYERS.map((player) => (
                    <tr key={player.id} className="border-b border-border hover:bg-background/50 transition">
                      <td className="px-6 py-4 font-semibold">{player.name}</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-500/20 text-blue-400">{player.team}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-purple-500/20 text-purple-400">{player.position}</Badge>
                      </td>
                      <td className="px-6 py-4">#{player.jerseyNo}</td>
                      <td className="px-6 py-4 font-semibold text-green-400">{player.goals}</td>
                      <td className="px-6 py-4 font-semibold text-blue-400">{player.assists}</td>
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
