'use client';

import { Sidebar } from "@/components/ui/sidebar"
import { ArrowRight } from 'lucide-react'; // Import ArrowRight

import { Suspense, useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Plus, Trash2, Trophy, Users, Calendar, Zap, Flame, Brain, X, Save } from 'lucide-react';
import { getAdminSport, setAdminSport } from '@/lib/admin-sport';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

const SPORT_COLORS: Record<string, string> = {
  cricket: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  football: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  volleyball: 'bg-stone-500/15 text-stone-700 dark:text-stone-400',
  basketball: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  kabaddi: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  shuttle: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  tennis: 'bg-lime-500/15 text-lime-700 dark:text-lime-400',
};

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('sport')?.toLowerCase();
  const fromStorage = getAdminSport()?.toLowerCase();
  const sport = (fromUrl || fromStorage || 'cricket').toLowerCase();

  // Persist sport when coming from URL (e.g. after login) so it stays when navigating
  useEffect(() => {
    if (fromUrl) setAdminSport(fromUrl);
  }, [fromUrl]);

  const sportEmoji = SPORT_EMOJI[sport] || '🏆';
  const sportColorClass = SPORT_COLORS[sport] || 'bg-slate-500/15 text-slate-700 dark:text-slate-400';

  // Modal states
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showEditMatchModal, setShowEditMatchModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [matchForm, setMatchForm] = useState({
    team1: '',
    team2: '',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    score1: 0,
    score2: 0,
    sportType: sport,
  });

  const [teamForm, setTeamForm] = useState({
    name: '',
    players: 0,
    description: '',
    sportType: sport,
  });

  // Filter matches for this sport only
  const [matches, setMatches] = useState([
    {
      id: 1,
      team1: 'Team A',
      team2: 'Team B',
      score1: 142,
      score2: 89,
      status: 'live',
      venue: 'Main Ground',
      time: '2:00 PM',
      sportType: sport,
    },
    {
      id: 2,
      team1: 'Team C',
      team2: 'Team D',
      score1: 95,
      score2: 87,
      status: 'live',
      venue: 'Secondary Field',
      time: '4:30 PM',
      sportType: sport,
    },
  ]);

  const [teams, setTeams] = useState([
    { id: 1, name: 'Team A', players: 11, matches: 5, wins: 4, sportType: sport },
    { id: 2, name: 'Team B', players: 11, matches: 4, wins: 2, sportType: sport },
    { id: 3, name: 'Team C', players: 12, matches: 6, wins: 5, sportType: sport },
  ]);

  // Match Handlers
  const handleAddMatch = () => {
    setMatchForm({
      team1: '',
      team2: '',
      venue: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      score1: 0,
      score2: 0,
      sportType: sport,
    });
    setShowAddMatchModal(true);
  };

  const handleEditMatch = (match: any) => {
    setSelectedMatch(match);
    setMatchForm({
      team1: match.team1,
      team2: match.team2,
      venue: match.venue,
      date: new Date().toISOString().split('T')[0],
      time: match.time,
      score1: match.score1,
      score2: match.score2,
      sportType: match.sportType || sport,
    });
    setShowEditMatchModal(true);
  };

  const handleSaveMatch = async () => {
    // Validation
    if (!matchForm.team1 || !matchForm.team2) {
      alert('Please enter both team names');
      return;
    }
    if (matchForm.team1 === matchForm.team2) {
      alert('Teams cannot be the same!');
      return;
    }
    if (!matchForm.venue) {
      alert('Please enter a venue');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (showEditMatchModal && selectedMatch) {
        // Update existing match
        setMatches(matches.map(m => 
          m.id === selectedMatch.id 
            ? { ...m, ...matchForm }
            : m
        ));
        alert(`✅ Match updated successfully for ${sport}!`);
      } else {
        // Add new match
        const newMatch = {
          id: Math.max(...matches.map(m => m.id), 0) + 1,
          ...matchForm,
          status: 'live',
          sportType: sport,
        };
        setMatches([...matches, newMatch]);
        alert(`✅ Match added successfully to ${sport}!\n\nThis match will now appear in the ${sport} user panel.`);
      }
      
      setShowAddMatchModal(false);
      setShowEditMatchModal(false);
    } catch (error) {
      alert('❌ Error saving match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm(`Are you sure you want to delete this ${sport} match?`)) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setMatches(matches.filter(m => m.id !== matchId));
      alert(`✅ Match deleted successfully from ${sport}!`);
    } catch (error) {
      alert('❌ Error deleting match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Team Handlers
  const handleAddTeam = () => {
    setTeamForm({
      name: '',
      players: 0,
      description: '',
      sportType: sport,
    });
    setShowAddTeamModal(true);
  };

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team);
    setTeamForm({
      name: team.name,
      players: team.players,
      description: team.description || '',
      sportType: team.sportType || sport,
    });
    setShowEditTeamModal(true);
  };

  const handleSaveTeam = async () => {
    if (!teamForm.name) {
      alert('⚠️ Please enter a team name');
      return;
    }
    if (teamForm.players < 1) {
      alert('⚠️ Please enter a valid number of players');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (showEditTeamModal && selectedTeam) {
        // Update existing team
        setTeams(teams.map(t => 
          t.id === selectedTeam.id 
            ? { ...t, ...teamForm, sportType: sport }
            : t
        ));
        alert(`✅ Team "${teamForm.name}" updated successfully for ${sport}!`);
      } else {
        // Add new team
        const newTeam = {
          id: Math.max(...teams.map(t => t.id), 0) + 1,
          ...teamForm,
          matches: 0,
          wins: 0,
          sportType: sport,
        };
        setTeams([...teams, newTeam]);
        alert(`✅ Team "${teamForm.name}" added successfully to ${sport}!\n\nThis team will now appear in:\n• ${sport.charAt(0).toUpperCase() + sport.slice(1)} team listings\n• Match selection dropdowns\n• ${sport.charAt(0).toUpperCase() + sport.slice(1)} user panel`);
      }
      
      setShowAddTeamModal(false);
      setShowEditTeamModal(false);
    } catch (error) {
      alert('❌ Error saving team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!confirm(`Are you sure you want to delete team "${team?.name}" from ${sport}?`)) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeams(teams.filter(t => t.id !== teamId));
      alert(`✅ Team deleted successfully from ${sport}!`);
    } catch (error) {
      alert('❌ Error deleting team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const TEAMS = teams;
  const ONGOING_MATCHES = matches;

  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar sport={sport} sportIcon={sportEmoji} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Top bar - sport themed */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-[var(--sport-primary-muted)]">
                <span className="text-sm font-bold uppercase text-[var(--sport-primary)]">{sport} Admin</span>
              </div>
              <h1 className="text-2xl font-bold">Manage {sport}</h1>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <span className="text-4xl flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--sport-primary-muted)]">{sportEmoji}</span>
              <span className="text-foreground">{sport.charAt(0).toUpperCase() + sport.slice(1)} Management</span>
            </h2>
            <p className="text-muted-foreground">Update scores, manage teams, and track matches</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border hover:border-muted-foreground/20 transition">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Live Matches</p>
                    <p className="text-3xl font-bold">2</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--sport-primary-muted)]">
                    <Zap className="w-6 h-6 text-[var(--sport-primary)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-muted-foreground/20 transition">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Teams</p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--sport-primary-muted)]">
                    <Users className="w-6 h-6 text-[var(--sport-primary)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-muted-foreground/20 transition">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Players</p>
                    <p className="text-3xl font-bold">34</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--sport-primary-muted)]">
                    <Trophy className="w-6 h-6 text-[var(--sport-primary)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Highlights and Quiz Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Highlights Management */}
            <Link href={`/admin/highlights?sport=${sport}`}>
              <Card className="bg-card border-border h-full hover:shadow-md hover:border-amber-500/40 dark:hover:border-amber-400/40 transition cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Highlights</h3>
                      <p className="text-sm text-muted-foreground">Manage sport highlights</p>
                    </div>
                    <Flame className="w-8 h-8 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition" />
                  </div>
                  <Button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-900">
                    Manage Highlights
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Quiz Management */}
            <Link href={`/admin/quiz?sport=${sport}`}>
              <Card className="bg-card border-border h-full hover:shadow-md hover:border-blue-500/40 dark:hover:border-blue-400/40 transition cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Quiz</h3>
                      <p className="text-sm text-muted-foreground">Manage sports quizzes</p>
                    </div>
                    <Brain className="w-8 h-8 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition" />
                  </div>
                  <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white">
                    Manage Quizzes
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Live Matches Management */}
          <Card className="bg-card border-border mb-8">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-500 dark:text-red-400" />
                  Live Matches
                </CardTitle>
                <CardDescription>Update scores in real-time</CardDescription>
              </div>
              <Button 
                onClick={handleAddMatch}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Match
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ONGOING_MATCHES.map((match) => (
                  <div
                    key={match.id}
                    className="p-5 bg-background rounded-lg border border-border hover:border-muted-foreground/25 transition"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className="animate-pulse bg-red-500 text-white border-0 hover:bg-red-500 dark:bg-red-500 dark:text-white">LIVE</Badge>
                        <span className="text-sm font-semibold">{match.venue}</span>
                        <span className="text-xs text-muted-foreground">{match.time}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">{match.team1}</p>
                        <div className="text-4xl font-bold text-foreground">{match.score1}</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Inning 2</span>
                          <p className="text-lg font-semibold text-muted-foreground">VS</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">{match.team2}</p>
                        <div className="text-4xl font-bold text-foreground">{match.score2}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        size="sm"
                        onClick={() => handleEditMatch(match)}
                        disabled={isLoading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Update Score
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMatch(match.id)}
                        disabled={isLoading}
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Teams Management */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  Teams
                </CardTitle>
                <CardDescription>Manage teams and players</CardDescription>
              </div>
              <Button 
                onClick={handleAddTeam}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Team Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Players</th>
                      <th className="text-left py-3 px-4 font-semibold">Matches</th>
                      <th className="text-left py-3 px-4 font-semibold">Wins</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAMS.map((team) => (
                      <tr key={team.id} className="border-b border-border hover:bg-background/50 transition">
                        <td className="py-3 px-4 font-medium">{team.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{team.players}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{team.matches} matches</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{team.wins}W</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTeam(team)}
                              disabled={isLoading}
                              className="border-blue-500/40 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTeam(team.id)}
                              disabled={isLoading}
                              className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
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
        </div>
      </main>

      {/* Add Match Modal */}
      <Dialog open={showAddMatchModal} onOpenChange={setShowAddMatchModal}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Match - {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Create a new {sport} match that will appear in the user {sport} section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Sport Type Indicator */}
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sport: {sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
                <Badge variant="secondary" className="ml-auto">
                  {sportEmoji} {sport}
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team 1 *</label>
                <select
                  value={matchForm.team1}
                  onChange={(e) => setMatchForm({ ...matchForm, team1: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Select Team 1</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Or type a new team name
                </p>
                <Input
                  value={matchForm.team1}
                  onChange={(e) => setMatchForm({ ...matchForm, team1: e.target.value })}
                  placeholder="Enter team name"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 *</label>
                <select
                  value={matchForm.team2}
                  onChange={(e) => setMatchForm({ ...matchForm, team2: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Select Team 2</option>
                  {teams.filter(t => t.name !== matchForm.team1).map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Or type a new team name
                </p>
                <Input
                  value={matchForm.team2}
                  onChange={(e) => setMatchForm({ ...matchForm, team2: e.target.value })}
                  placeholder="Enter team name"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Venue *</label>
              <Input
                value={matchForm.venue}
                onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                placeholder="Enter venue"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={matchForm.date}
                  onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <Input
                  type="time"
                  value={matchForm.time}
                  onChange={(e) => setMatchForm({ ...matchForm, time: e.target.value })}
                  placeholder="e.g., 2:00 PM"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team 1 Score</label>
                <Input
                  type="number"
                  value={matchForm.score1}
                  onChange={(e) => setMatchForm({ ...matchForm, score1: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 Score</label>
                <Input
                  type="number"
                  value={matchForm.score2}
                  onChange={(e) => setMatchForm({ ...matchForm, score2: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveMatch}
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Match'}
              </Button>
              <Button 
                onClick={() => setShowAddMatchModal(false)}
                disabled={isLoading}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Match Modal */}
      <Dialog open={showEditMatchModal} onOpenChange={setShowEditMatchModal}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Update Match Score
            </DialogTitle>
            <DialogDescription>
              Update the match details and scores
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team 1</label>
                <Input
                  value={matchForm.team1}
                  onChange={(e) => setMatchForm({ ...matchForm, team1: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2</label>
                <Input
                  value={matchForm.team2}
                  onChange={(e) => setMatchForm({ ...matchForm, team2: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team 1 Score</label>
                <Input
                  type="number"
                  value={matchForm.score1}
                  onChange={(e) => setMatchForm({ ...matchForm, score1: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 Score</label>
                <Input
                  type="number"
                  value={matchForm.score2}
                  onChange={(e) => setMatchForm({ ...matchForm, score2: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveMatch}
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Match'}
              </Button>
              <Button 
                onClick={() => setShowEditMatchModal(false)}
                disabled={isLoading}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Team Modal */}
      <Dialog open={showAddTeamModal} onOpenChange={setShowAddTeamModal}>
        <DialogContent className="bg-card border-border max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Team - {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Create a new {sport} team that will appear in team lists and match dropdowns
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Sport Type Indicator */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Sport: {sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
                <Badge variant="outline" className="ml-auto border-amber-500/50 text-amber-400">
                  {sportEmoji} {sport}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This team will be available for {sport} matches and will appear in the {sport} user section
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Team Name *</label>
              <Input
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Players *</label>
              <Input
                type="number"
                value={teamForm.players}
                onChange={(e) => setTeamForm({ ...teamForm, players: parseInt(e.target.value) || 0 })}
                min="1"
                placeholder="e.g., 11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Textarea
                value={teamForm.description}
                onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                placeholder="Enter team description"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveTeam}
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Team'}
              </Button>
              <Button 
                onClick={() => setShowAddTeamModal(false)}
                disabled={isLoading}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Team Modal */}
      <Dialog open={showEditTeamModal} onOpenChange={setShowEditTeamModal}>
        <DialogContent className="bg-card border-border max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Team
            </DialogTitle>
            <DialogDescription>
              Update team information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team Name</label>
              <Input
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Players</label>
              <Input
                type="number"
                value={teamForm.players}
                onChange={(e) => setTeamForm({ ...teamForm, players: parseInt(e.target.value) || 0 })}
                min="1"
                placeholder="e.g., 11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Textarea
                value={teamForm.description}
                onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                placeholder="Enter team description"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveTeam}
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Team'}
              </Button>
              <Button 
                onClick={() => setShowEditTeamModal(false)}
                disabled={isLoading}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardContent />
    </Suspense>
  );
}
