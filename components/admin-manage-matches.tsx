'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Calendar, Plus, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminPageHeader } from '@/components/admin-page-header';

export interface MatchRow {
  id: number;
  team1: string;
  team2: string;
  date: string;
  time: string;
  venue: string;
  status: string;
}

const defaultMatches: MatchRow[] = [
  { id: 1, team1: 'India', team2: 'Australia', date: '2024-02-15', time: '2:30 PM', status: 'upcoming', venue: 'MCG' },
  { id: 2, team1: 'England', team2: 'Pakistan', date: '2024-02-10', time: '3:00 PM', status: 'completed', venue: "Lord's" },
  { id: 3, team1: 'Sri Lanka', team2: 'West Indies', date: '2024-02-18', time: '2:00 PM', status: 'upcoming', venue: 'Eden Gardens' },
];

interface AdminManageMatchesProps {
  sport: string;
  sportIcon: string;
  initialMatches?: MatchRow[];
}

export function AdminManageMatches({ sport, sportIcon, initialMatches = defaultMatches }: AdminManageMatchesProps) {
  const [matches, setMatches] = useState<MatchRow[]>(initialMatches);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    team1: '',
    team2: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    venue: '',
    status: 'upcoming',
  });

  const openAdd = () => {
    setForm({
      team1: '',
      team2: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      venue: '',
      status: 'upcoming',
    });
    setEditingMatch(null);
    setShowAddModal(true);
    setShowEditModal(false);
  };

  const openEdit = (match: MatchRow) => {
    setEditingMatch(match);
    setForm({
      team1: match.team1,
      team2: match.team2,
      date: match.date,
      time: match.time,
      venue: match.venue,
      status: match.status,
    });
    setShowEditModal(true);
    setShowAddModal(false);
  };

  const saveMatch = async () => {
    if (!form.team1?.trim() || !form.team2?.trim()) {
      alert('Please enter both team names.');
      return;
    }
    if (form.team1 === form.team2) {
      alert('Teams cannot be the same.');
      return;
    }
    if (!form.venue?.trim()) {
      alert('Please enter a venue.');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (showEditModal && editingMatch) {
        setMatches(matches.map((m) => (m.id === editingMatch.id ? { ...editingMatch, ...form } : m)));
        alert(`Match updated successfully for ${sport}!`);
        setShowEditModal(false);
      } else {
        const newId = Math.max(0, ...matches.map((m) => m.id)) + 1;
        setMatches([...matches, { id: newId, ...form }]);
        alert(`Match added successfully to ${sport}!`);
        setShowAddModal(false);
      }
    } catch {
      alert('Error saving match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMatch = async (id: number) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setMatches(matches.filter((m) => m.id !== id));
      alert('Match deleted successfully.');
    } catch {
      alert('Error deleting match.');
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
                          {match.team1} <span className="text-muted-foreground">vs</span> {match.team2}
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
                <Input
                  value={form.team1}
                  onChange={(e) => setForm({ ...form, team1: e.target.value })}
                  placeholder="Team 1 name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 *</label>
                <Input
                  value={form.team2}
                  onChange={(e) => setForm({ ...form, team2: e.target.value })}
                  placeholder="Team 2 name"
                />
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
