'use client';

import { AdminSidebar } from '@/components/admin-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';

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
  { id: 1, name: 'Alice Johnson', team: 'Team X', position: 'Setter', jerseyNo: 1, points: 245 },
  { id: 2, name: 'Bob Smith', team: 'Team Y', position: 'Spiker', jerseyNo: 9, points: 320 },
];

export default function VolleyballPlayersPage() {
  const sport = 'volleyball';
  const sportEmoji = SPORT_EMOJI[sport] || '🏆';

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar sport={sport} sportIcon={sportEmoji} />
      <main className="flex-1 ml-64 overflow-auto bg-background">
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏐</span>
              <div>
                <h1 className="text-2xl font-bold">Volleyball Players</h1>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              Add Player
            </Button>
          </div>
        </div>
        <div className="p-8">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Team</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Position</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Points</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PLAYERS.map((player) => (
                  <tr key={player.id} className="border-b border-border">
                    <td className="px-6 py-4 font-semibold">{player.name}</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-blue-500/20">{player.team}</Badge>
                    </td>
                    <td className="px-6 py-4">{player.position}</td>
                    <td className="px-6 py-4 font-semibold">{player.points}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"><Edit2 className="w-4 h-4 text-blue-500" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
