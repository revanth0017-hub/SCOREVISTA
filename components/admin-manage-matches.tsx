'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Calendar, Plus, Save, X, Activity } from 'lucide-react';
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

export interface MatchRow {
  id: string;
  sportId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  date: string;
  time: string;
  venue: string;
  status: string;
  scoreA?: number;
  scoreB?: number;
}

type SportDoc = { _id: string; slug: string; name: string };
type TeamDoc = { _id: string; name: string };
type MatchDoc = {
  _id: string;
  sport: string;
  teamA: TeamDoc | string;
  teamB: TeamDoc | string;
  venue?: string;
  date?: string;
  time?: string;
  status?: string;
  scoreA?: number;
  scoreB?: number;
};

interface AdminManageMatchesProps {
  sport: string;
  sportIcon: string;
}

export function AdminManageMatches({ sport, sportIcon }: AdminManageMatchesProps) {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [teams, setTeams] = useState<TeamDoc[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sportId, setSportId] = useState<string | null>(null);
  const [form, setForm] = useState({
    teamAId: '',
    teamBId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    venue: '',
    status: 'upcoming',
  });

  const sportSlug = useMemo(() => sport.toLowerCase(), [sport]);

  const fetchSportId = async () => {
    const res = await api.get<{ success: boolean; data: SportDoc[] }>('/api/sports');
    const list = (res as { data?: SportDoc[] }).data || [];
    const s = list.find((x) => x.slug === sportSlug);
    return s?._id || null;
  };

  const fetchTeams = async (sid: string) => {
    const res = await api.get<{ success: boolean; data: TeamDoc[] }>(`/api/teams?sportId=${encodeURIComponent(sid)}`);
    const list = (res as { data?: TeamDoc[] }).data || [];
    setTeams(list);
    return list;
  };

  const toRow = (m: MatchDoc): MatchRow => {
    const teamA = typeof m.teamA === 'string' ? { _id: m.teamA, name: 'Team A' } : m.teamA;
    const teamB = typeof m.teamB === 'string' ? { _id: m.teamB, name: 'Team B' } : m.teamB;
    return {
      id: m._id,
      sportId: m.sport,
      teamAId: teamA._id,
      teamBId: teamB._id,
      teamAName: teamA.name,
      teamBName: teamB.name,
      date: m.date || new Date().toISOString().split('T')[0],
      time: m.time || '',
      venue: m.venue || '',
      status: m.status || 'upcoming',
      scoreA: m.scoreA ?? 0,
      scoreB: m.scoreB ?? 0,
    };
  };

  const fetchMatches = async (sid: string) => {
    const res = await api.get<{ success: boolean; data: MatchDoc[] }>(`/api/matches?sportId=${encodeURIComponent(sid)}`);
    const list = (res as { data?: MatchDoc[] }).data || [];
    setMatches(list.map(toRow));
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const sid = await fetchSportId();
        if (!sid) {
          if (!cancelled) {
            setSportId(null);
            setTeams([]);
            setMatches([]);
          }
          return;
        }
        if (!cancelled) setSportId(sid);
        await fetchTeams(sid);
        await fetchMatches(sid);
      } catch (err) {
        if (!cancelled) {
          setSportId(null);
          setTeams([]);
          setMatches([]);
          const msg = messageIfWorthShowing(err);
          if (msg) setError(msg);
        }
      }
    })().finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sportSlug]);

  const openAdd = () => {
    setForm({
      teamAId: '',
      teamBId: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      venue: '',
      status: 'upcoming',
    });
    setEditingMatch(null);
    setShowAddModal(true);
    setShowEditModal(false);
    setError(null);
  };

  const openEdit = (match: MatchRow) => {
    setEditingMatch(match);
    setForm({
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      date: match.date,
      time: match.time,
      venue: match.venue,
      status: match.status,
    });
    setShowEditModal(true);
    setShowAddModal(false);
    setError(null);
  };

  const saveMatch = async () => {
    if (!sportId) return;
    if (!form.teamAId || !form.teamBId) return setError('Please select both teams');
    if (form.teamAId === form.teamBId) return setError('Teams cannot be the same');
    if (!form.venue?.trim()) {
      return setError('Please enter a venue.');
    }
    setIsLoading(true);
    setError(null);
    try {
      if (showEditModal && editingMatch) {
        await api.patch(`/api/matches/${editingMatch.id}`, {
          venue: form.venue,
          date: form.date,
          time: form.time,
          status: form.status,
        });
        setShowEditModal(false);
      } else {
        await api.postJson('/api/matches', {
          sportId,
          teamAId: form.teamAId,
          teamBId: form.teamBId,
          venue: form.venue,
          date: form.date,
          time: form.time,
          status: form.status,
        });
        setShowAddModal(false);
      }
      await fetchMatches(sportId);
    } catch (err) {
      setError(safeActionError(err, 'Unable to save the match. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    if (!sportId) return;
    setIsLoading(true);
    try {
      await api.delete(`/api/matches/${id}`);
      await fetchMatches(sportId);
    } catch (err) {
      setError(safeActionError(err, 'Unable to delete the match.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        icon={sportIcon}
        title={`Manage ${sport.charAt(0).toUpperCase() + sport.slice(1)} Matches`}
        description="Add, edit, and manage all matches"
        buttonLabel="Add Match"
        onButtonClick={openAdd}
      />

      <main className="flex-1 overflow-auto p-8 space-y-8">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Total Matches</p>
                <p className="text-3xl font-bold mt-2">{matches.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Upcoming</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{matches.filter((m) => m.status === 'upcoming').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Completed</p>
                <p className="text-3xl font-bold mt-2 text-blue-600">{matches.filter((m) => m.status === 'completed').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Live</p>
                <p className="text-3xl font-bold mt-2 text-red-600">{matches.filter((m) => m.status === 'live').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>All Matches</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold">Match</th>
                    <th className="text-left py-4 px-4 font-semibold">Date & Time</th>
                    <th className="text-left py-4 px-4 font-semibold">Venue</th>
                    <th className="text-left py-4 px-4 font-semibold">Status</th>
                    <th className="text-left py-4 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-b border-border hover:bg-background/50 transition">
                      <td className="py-4 px-4">
                        <div className="font-semibold">
                          {match.teamAName} <span className="text-muted-foreground">vs</span> {match.teamBName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {match.date} {match.time}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{match.venue}</td>
                      <td className="py-4 px-4">
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
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/${sport.toLowerCase()}/matches/${match.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-500/10 border-green-500/30 bg-transparent"
                              disabled={isLoading}
                            >
                              <Activity className="w-4 h-4 text-green-600" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:bg-blue-500/10 border-blue-500/30 bg-transparent"
                            onClick={() => openEdit(match)}
                            disabled={isLoading}
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-500/10 border-red-500/30 bg-transparent"
                            onClick={() => deleteMatch(match.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => { if (!open) { setShowAddModal(false); setShowEditModal(false); } }}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showEditModal ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showEditModal ? 'Edit Match' : 'Add New Match'}
            </DialogTitle>
            <DialogDescription>
              {showEditModal ? 'Update match details.' : `Create a new ${sport} match.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team 1 *</label>
                <select
                  value={form.teamAId}
                  onChange={(e) => setForm({ ...form, teamAId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Select team</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 *</label>
                <select
                  value={form.teamBId}
                  onChange={(e) => setForm({ ...form, teamBId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Select team</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Venue *</label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Venue"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <Input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="e.g. 2:30 PM"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={saveMatch} disabled={isLoading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : showEditModal ? 'Update Match' : 'Save Match'}
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
