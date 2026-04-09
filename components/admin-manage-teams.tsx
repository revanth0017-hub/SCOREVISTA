'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { api } from '@/lib/api';
import { messageIfWorthShowing, safeActionError } from '@/lib/client-errors';

export interface TeamRow {
  id: string;
  name: string;
  players: number;
  wins: number;
  losses: number;
  captain: string;
}

type SportDoc = { _id: string; slug: string; name: string };
type TeamDoc = {
  _id: string;
  name: string;
  players?: number;
  wins?: number;
  losses?: number;
  captain?: string;
};

interface AdminManageTeamsProps {
  sport: string;
  sportIcon: string;
}

export function AdminManageTeams({ sport, sportIcon }: AdminManageTeamsProps) {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sportId, setSportId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    players: 11,
    wins: 0,
    losses: 0,
    captain: '',
  });

  const sportSlug = useMemo(() => sport.toLowerCase(), [sport]);

  const fetchTeams = async (sid: string) => {
    const res = await api.get<{ success: boolean; data: TeamDoc[] }>(`/api/teams?sportId=${encodeURIComponent(sid)}`);
    const list = (res as { data?: TeamDoc[] }).data || [];
    setTeams(
      list.map((t) => ({
        id: t._id,
        name: t.name,
        players: t.players ?? 0,
        wins: t.wins ?? 0,
        losses: t.losses ?? 0,
        captain: t.captain ?? '',
      }))
    );
  };

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .get<{ success: boolean; data: SportDoc[] }>('/api/sports')
      .then((res) => {
        const list = (res as { data?: SportDoc[] }).data || [];
        const s = list.find((x) => x.slug === sportSlug);
        if (!cancelled) setSportId(s?._id || null);
      })
      .catch((err) => {
        if (!cancelled) {
          setSportId(null);
          const msg = messageIfWorthShowing(err);
          if (msg) setError(msg);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sportSlug]);

  useEffect(() => {
    if (!sportId) return;
    setIsLoading(true);
    fetchTeams(sportId)
      .catch((err) => {
        const msg = messageIfWorthShowing(err);
        if (msg) setError(msg);
      })
      .finally(() => setIsLoading(false));
  }, [sportId]);

  const openAdd = () => {
    setForm({ name: '', players: 11, wins: 0, losses: 0, captain: '' });
    setEditingTeam(null);
    setShowAddModal(true);
    setShowEditModal(false);
    setError(null);
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
    setError(null);
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
    if (!sportId) {
      setError('Sport is not ready yet');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (showEditModal && editingTeam) {
        await api.patch(`/api/teams/${editingTeam.id}`, { ...form });
        setShowEditModal(false);
      } else {
        await api.postJson('/api/teams', { ...form, sportId });
        setShowAddModal(false);
      }
      await fetchTeams(sportId);
    } catch (err) {
      setError(safeActionError(err, 'Unable to save the team. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (id: string) => {
    const team = teams.find((t) => t.id === id);
    if (!confirm(`Are you sure you want to delete team "${team?.name}"?`)) return;
    if (!sportId) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/api/teams/${id}`);
      await fetchTeams(sportId);
    } catch (err) {
      setError(safeActionError(err, 'Unable to delete the team.'));
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
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
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
