'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminPageHeader } from '@/components/admin-page-header';

export interface TeamRow {
  id: number;
  name: string;
  players: number;
  wins: number;
  losses: number;
  captain: string;
}

const defaultTeams: TeamRow[] = [
  { id: 1, name: 'Team A', players: 11, wins: 5, losses: 2, captain: 'John Doe' },
  { id: 2, name: 'Team B', players: 11, wins: 4, losses: 3, captain: 'Jane Smith' },
  { id: 3, name: 'Team C', players: 10, wins: 6, losses: 1, captain: 'Mike Johnson' },
  { id: 4, name: 'Team D', players: 11, wins: 3, losses: 4, captain: 'Sarah Williams' },
];

interface AdminManageTeamsProps {
  sport: string;
  sportIcon: string;
  initialTeams?: TeamRow[];
}

export function AdminManageTeams({ sport, sportIcon, initialTeams = defaultTeams }: AdminManageTeamsProps) {
  const [teams, setTeams] = useState<TeamRow[]>(initialTeams);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    players: 11,
    wins: 0,
    losses: 0,
    captain: '',
  });

  const openAdd = () => {
    setForm({ name: '', players: 11, wins: 0, losses: 0, captain: '' });
    setEditingTeam(null);
    setShowAddModal(true);
    setShowEditModal(false);
  };

  const openEdit = (team: TeamRow) => {
    setEditingTeam(team);
    setForm({
      name: team.name,
      players: team.players,
      wins: team.wins,
      losses: team.losses,
      captain: team.captain,
    });
    setShowEditModal(true);
    setShowAddModal(false);
  };

  const saveTeam = async () => {
    if (!form.name?.trim()) {
      alert('Please enter a team name.');
      return;
    }
    if (form.players < 1) {
      alert('Please enter a valid number of players.');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (showEditModal && editingTeam) {
        setTeams(teams.map((t) => (t.id === editingTeam.id ? { ...editingTeam, ...form } : t)));
        alert(`Team "${form.name}" updated successfully for ${sport}!`);
        setShowEditModal(false);
      } else {
        const newId = Math.max(0, ...teams.map((t) => t.id)) + 1;
        setTeams([...teams, { id: newId, ...form }]);
        alert(`Team "${form.name}" added successfully to ${sport}!`);
        setShowAddModal(false);
      }
    } catch {
      alert('Error saving team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (id: number) => {
    const team = teams.find((t) => t.id === id);
    if (!confirm(`Are you sure you want to delete team "${team?.name}"?`)) return;
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setTeams(teams.filter((t) => t.id !== id));
      alert('Team deleted successfully.');
    } catch {
      alert('Error deleting team.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        icon={sportIcon}
        title={`Manage ${sport.charAt(0).toUpperCase() + sport.slice(1)} Teams`}
        description="Create, edit, and manage teams"
        buttonLabel="Add Team"
        onButtonClick={openAdd}
      />

      <div className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="bg-card border-border hover:shadow-lg transition">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{team.name}</CardTitle>
                    <CardDescription>Captain: {team.captain}</CardDescription>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">{team.wins}W</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-background rounded p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Players</p>
                    <p className="text-2xl font-bold text-blue-500">{team.players}</p>
                  </div>
                  <div className="bg-background rounded p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Wins</p>
                    <p className="text-2xl font-bold text-green-500">{team.wins}</p>
                  </div>
                  <div className="bg-background rounded p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Losses</p>
                    <p className="text-2xl font-bold text-red-500">{team.losses}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent text-blue-500 hover:text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                    size="sm"
                    onClick={() => openEdit(team)}
                    disabled={isLoading}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-red-500 hover:text-red-600 bg-transparent border-red-500/30 hover:bg-red-500/10"
                    size="sm"
                    onClick={() => deleteTeam(team.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => { if (!open) { setShowAddModal(false); setShowEditModal(false); } }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showEditModal ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showEditModal ? 'Edit Team' : 'Add New Team'}
            </DialogTitle>
            <DialogDescription>
              {showEditModal ? 'Update team details.' : `Add a new ${sport} team.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Captain</label>
              <Input
                value={form.captain}
                onChange={(e) => setForm({ ...form, captain: e.target.value })}
                placeholder="Captain name"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Players</label>
                <Input
                  type="number"
                  min={1}
                  value={form.players}
                  onChange={(e) => setForm({ ...form, players: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Wins</label>
                <Input
                  type="number"
                  min={0}
                  value={form.wins}
                  onChange={(e) => setForm({ ...form, wins: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Losses</label>
                <Input
                  type="number"
                  min={0}
                  value={form.losses}
                  onChange={(e) => setForm({ ...form, losses: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={saveTeam} disabled={isLoading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : showEditModal ? 'Update Team' : 'Save Team'}
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
