'use client';

import { Sidebar } from "@/components/ui/sidebar"
import { ArrowRight } from 'lucide-react'; // Import ArrowRight

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, clearToken, setUser } from '@/lib/api';
import { isLikelyNetworkFailure, safeActionError } from '@/lib/client-errors';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Plus, Trash2, Trophy, Users, Calendar, Zap, Flame, Brain, X, Save, MessageSquare } from 'lucide-react';
import { getAdminSport, setAdminSport, clearAdminSport } from '@/lib/admin-sport';
import { getSocket } from '@/lib/socket';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type SportDoc = { _id: string; slug: string; name: string; icon?: string };
type TeamDoc = { _id: string; name: string; players?: number; wins?: number };
type MatchDoc = {
  _id: string;
  sport: string; // sportId
  teamA: { _id: string; name: string };
  teamB: { _id: string; name: string };
  venue?: string;
  date?: string;
  time?: string;
  status?: string;
  scoreA?: number;
  scoreB?: number;
};

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
  const [isRetiring, setIsRetiring] = useState(false);

  const router = useRouter();

  const [sportId, setSportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [matchForm, setMatchForm] = useState({
    teamAId: '',
    teamBId: '',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    scoreA: 0,
    scoreB: 0,
    status: 'live' as 'upcoming' | 'live' | 'completed',
    sportType: sport,
  });

  const [teamForm, setTeamForm] = useState({
    name: '',
    players: 0,
    description: '',
    sportType: sport,
  });

  const [matches, setMatches] = useState<MatchDoc[]>([]);
  const [teams, setTeams] = useState<TeamDoc[]>([]);

  const liveMatches = useMemo(
    () => matches.filter((m) => (m.status || '').toLowerCase() === 'live'),
    [matches]
  );

  const fetchSportId = async (): Promise<string> => {
    const sportsRes = await api.get<{ success: boolean; data: SportDoc[] }>('/api/sports');
    const sports = (sportsRes as { data?: SportDoc[] }).data || [];
    const s = sports.find((x) => x.slug === sport);
    if (!s?._id) throw new Error(`Sport not found: ${sport}`);
    return s._id;
  };

  const fetchTeams = async (sid: string) => {
    const res = await api.get<{ success: boolean; data: TeamDoc[] }>(`/api/teams?sportId=${encodeURIComponent(sid)}`);
    const list = (res as { data?: TeamDoc[] }).data || [];
    setTeams(list);
  };

  const fetchMatches = async (sid: string) => {
    const res = await api.get<{ success: boolean; data: MatchDoc[] }>(`/api/matches?sportId=${encodeURIComponent(sid)}`);
    const list = (res as { data?: MatchDoc[] }).data || [];
    setMatches(list);
  };

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setIsLoading(true);
    (async () => {
      const sid = await fetchSportId();
      if (!cancelled) setSportId(sid);
      await Promise.all([fetchTeams(sid), fetchMatches(sid)]);
    })()
      .catch((err) => {
        if (cancelled) return;
        setSportId(null);
        setTeams([]);
        setMatches([]);
        if (!isLikelyNetworkFailure(err)) {
          setError(safeActionError(err, 'Unable to load admin data. Please try again.'));
        }
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sport]);

  useEffect(() => {
    if (!sportId) return;
    const socket = getSocket();
    const onMatchCreated = (m: MatchDoc) => {
      if (m.sport !== sportId) return;
      setMatches((prev) => [m, ...prev]);
    };
    const onScoreUpdated = (m: MatchDoc) => {
      if (m.sport !== sportId) return;
      setMatches((prev) => prev.map((x) => (x._id === m._id ? m : x)));
    };
    socket.on('matchCreated', onMatchCreated);
    socket.on('scoreUpdated', onScoreUpdated);
    return () => {
      socket.off('matchCreated', onMatchCreated);
      socket.off('scoreUpdated', onScoreUpdated);
    };
  }, [sportId]);

  // admin actions
  const handleRetire = async () => {
    if (!confirm('Retiring will disable your account and return you to the home page. Proceed?')) return;
    setIsRetiring(true);
    try {
      await api.postJson('/api/auth/admin/retire', {});
      clearToken();
      setUser(null);
      clearAdminSport();
      router.push('/');
    } catch (err) {
      console.error('Retire error', err);
      alert(safeActionError(err, 'Unable to complete retire. Please try again.'));
    } finally {
      setIsRetiring(false);
    }
  };

  // Match Handlers
  const handleAddMatch = () => {
    setMatchForm({
      teamAId: '',
      teamBId: '',
      venue: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      scoreA: 0,
      scoreB: 0,
      status: 'live',
      sportType: sport,
    });
    setShowAddMatchModal(true);
    setError(null);
  };

  const handleEditMatch = (match: any) => {
    setSelectedMatch(match);
    setMatchForm({
      teamAId: match.teamA?._id,
      teamBId: match.teamB?._id,
      venue: match.venue || '',
      date: match.date || new Date().toISOString().split('T')[0],
      time: match.time,
      scoreA: match.scoreA ?? 0,
      scoreB: match.scoreB ?? 0,
      status: (match.status || 'live') as 'upcoming' | 'live' | 'completed',
      sportType: match.sportType || sport,
    });
    setShowEditMatchModal(true);
    setError(null);
  };

  const handleSaveMatch = async () => {
    if (!sportId) return;
    if (!matchForm.teamAId || !matchForm.teamBId) return setError('Please select both teams');
    if (matchForm.teamAId === matchForm.teamBId) return setError('Teams cannot be the same!');
    if (!matchForm.venue) {
      return setError('Please enter a venue');
    }

    setIsLoading(true);
    try {
      if (showEditMatchModal && selectedMatch) {
        // Update match meta + score
        const patched = await api.patch<{ success: boolean; data: MatchDoc }>(`/api/matches/${selectedMatch._id}`, {
          venue: matchForm.venue,
          date: matchForm.date,
          time: matchForm.time,
          status: matchForm.status,
        });
        const scored = await api.putJson<{ success: boolean; data: MatchDoc }>(`/api/matches/${selectedMatch._id}/score`, {
          scoreA: matchForm.scoreA,
          scoreB: matchForm.scoreB,
          status: matchForm.status,
        });
        const updated = (scored as any)?.data || (patched as any)?.data;
        if (updated?._id) {
          setMatches((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
        }
      } else {
        await api.postJson('/api/matches', {
          sportId,
          teamAId: matchForm.teamAId,
          teamBId: matchForm.teamBId,
          venue: matchForm.venue,
          date: matchForm.date,
          time: matchForm.time,
          status: matchForm.status,
          scoreA: matchForm.scoreA,
          scoreB: matchForm.scoreB,
        });
      }
      await fetchMatches(sportId);
      setShowAddMatchModal(false);
      setShowEditMatchModal(false);
    } catch (error) {
      setError(safeActionError(error, 'Unable to save the match. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm(`Are you sure you want to delete this ${sport} match?`)) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/api/matches/${matchId}`);
      if (sportId) await fetchMatches(sportId);
    } catch (error) {
      setError(safeActionError(error, 'Unable to delete the match.'));
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

    if (!sportId) return;
    setIsLoading(true);
    setError(null);
    try {
      if (showEditTeamModal && selectedTeam?._id) {
        await api.patch(`/api/teams/${selectedTeam._id}`, { name: teamForm.name, players: teamForm.players });
      } else {
        await api.postJson('/api/teams', { name: teamForm.name, players: teamForm.players, sportId });
      }
      await fetchTeams(sportId);
      setShowAddTeamModal(false);
      setShowEditTeamModal(false);
    } catch (error) {
      setError(safeActionError(error, 'Unable to save the team. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm(`Are you sure you want to delete this team from ${sport}?`)) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/api/teams/${teamId}`);
      if (sportId) await fetchTeams(sportId);
    } catch (error) {
      setError(safeActionError(error, 'Unable to delete the team.'));
    } finally {
      setIsLoading(false);
    }
  };

  const TEAMS = teams;
  const ONGOING_MATCHES = liveMatches;

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
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRetire}
                disabled={isRetiring || isLoading}
              >
                {isRetiring ? 'Retiring...' : 'Retire Admin'}
              </Button>
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
                    key={match._id}
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
                        <p className="text-sm font-semibold mb-2">{match.teamA?.name}</p>
                        <div className="text-4xl font-bold text-foreground">{match.scoreA ?? 0}</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Inning 2</span>
                          <p className="text-lg font-semibold text-muted-foreground">VS</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">{match.teamB?.name}</p>
                        <div className="text-4xl font-bold text-foreground">{match.scoreB ?? 0}</div>
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
                        onClick={() => handleDeleteMatch(match._id)}
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
                      <tr key={team._id} className="border-b border-border hover:bg-background/50 transition">
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
                              onClick={() => handleDeleteTeam(team._id)}
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
                  value={matchForm.teamAId}
                  onChange={(e) => setMatchForm({ ...matchForm, teamAId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Select Team 1</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Create teams first if list is empty.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 *</label>
                <select
                  value={matchForm.teamBId}
                  onChange={(e) => setMatchForm({ ...matchForm, teamBId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Select Team 2</option>
                  {teams.filter((t) => t._id !== matchForm.teamAId).map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Create teams first if list is empty.</p>
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
                  value={matchForm.scoreA}
                  onChange={(e) => setMatchForm({ ...matchForm, scoreA: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 Score</label>
                <Input
                  type="number"
                  value={matchForm.scoreB}
                  onChange={(e) => setMatchForm({ ...matchForm, scoreB: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={matchForm.status}
                onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Set to Completed to move it into Results.
              </p>
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
                <Input value={selectedMatch?.teamA?.name || ''} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2</label>
                <Input value={selectedMatch?.teamB?.name || ''} disabled />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Team 1 Score</label>
                <Input
                  type="number"
                  value={matchForm.scoreA}
                  onChange={(e) => setMatchForm({ ...matchForm, scoreA: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Team 2 Score</label>
                <Input
                  type="number"
                  value={matchForm.scoreB}
                  onChange={(e) => setMatchForm({ ...matchForm, scoreB: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={matchForm.status}
                onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
              >
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose Completed to finish the match.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveMatch}
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update'}
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
