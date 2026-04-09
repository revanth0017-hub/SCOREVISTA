'use client';

import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Trophy, TrendingUp, Users, Zap, Flame, Brain } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { getUser } from '@/lib/api';

type SportDoc = { _id: string; name: string; slug: string; icon?: string };
type TeamDoc = { _id: string; name: string };
type MatchDoc = {
  _id: string;
  sport: string; // sportId
  teamA: TeamDoc;
  teamB: TeamDoc;
  status?: string;
  scoreA?: number;
  scoreB?: number;
  date?: string;
  time?: string;
};

const SPORT_COLOR: Record<string, string> = {
  cricket: '#059669',
  football: '#1D4ED8',
  volleyball: '#EA580C',
  basketball: '#C2410C',
  kabaddi: '#7F1D1D',
  shuttle: '#0F766E',
  tennis: '#65A30D',
};

/** Shown when the API has no sports yet or failed — keeps navigation usable */
const STATIC_SPORTS: SportDoc[] = [
  { _id: 'static-cricket', name: 'Cricket', slug: 'cricket', icon: '🏏' },
  { _id: 'static-football', name: 'Football', slug: 'football', icon: '⚽' },
  { _id: 'static-volleyball', name: 'Volleyball', slug: 'volleyball', icon: '🏐' },
  { _id: 'static-basketball', name: 'Basketball', slug: 'basketball', icon: '🏀' },
  { _id: 'static-kabaddi', name: 'Kabaddi', slug: 'kabaddi', icon: '🤼' },
  { _id: 'static-shuttle', name: 'Shuttle', slug: 'shuttle', icon: '🏸' },
  { _id: 'static-tennis', name: 'Tennis', slug: 'tennis', icon: '🎾' },
];

type DashboardMatch = MatchDoc & { isDemo?: boolean; demoSportSlug?: string };

/** Sample board when there are no live matches from the API */
const DEMO_LIVE_MATCHES: DashboardMatch[] = [
  {
    _id: 'demo-live-1',
    sport: 'static-cricket',
    teamA: { _id: 'demo-a', name: 'India' },
    teamB: { _id: 'demo-b', name: 'Australia' },
    status: 'live',
    scoreA: 142,
    scoreB: 138,
    date: 'Sample',
    time: 'Demo',
    isDemo: true,
    demoSportSlug: 'cricket',
  },
  {
    _id: 'demo-live-2',
    sport: 'static-football',
    teamA: { _id: 'demo-c', name: 'City FC' },
    teamB: { _id: 'demo-d', name: 'United' },
    status: 'live',
    scoreA: 2,
    scoreB: 1,
    date: 'Sample',
    time: 'Demo',
    isDemo: true,
    demoSportSlug: 'football',
  },
];

export default function DashboardPage() {
  const [sports, setSports] = useState<SportDoc[]>([]);
  const [matchesBySport, setMatchesBySport] = useState<Record<string, MatchDoc[]>>({});
  const [name, setName] = useState<string>(''); 

  const liveMatches = useMemo(() => {
    const all = Object.values(matchesBySport).flat();
    return all.filter((m) => (m.status || '').toLowerCase() === 'live');
  }, [matchesBySport]);

  const displaySports = sports.length > 0 ? sports : STATIC_SPORTS;

  const liveBoardMatches = useMemo((): DashboardMatch[] => {
    if (liveMatches.length > 0) return liveMatches as DashboardMatch[];
    return DEMO_LIVE_MATCHES;
  }, [liveMatches]);

  const counts = useMemo(() => {
    const all = Object.values(matchesBySport).flat();
    const upcoming = all.filter((m) => (m.status || '').toLowerCase() === 'upcoming').length;
    const completed = all.filter((m) => (m.status || '').toLowerCase() === 'completed').length;
    return { upcoming, completed, total: all.length, live: liveMatches.length };
  }, [matchesBySport, liveMatches.length]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = getUser();
      const displayName = (u?.name as string) || (u?.email as string) || '';
      if (!cancelled) setName(displayName ? displayName.split('@')[0] : '');

      try {
        const sportsRes = await api.get<{ success: boolean; data: SportDoc[] }>('/api/sports');
        const s = (sportsRes as { data?: SportDoc[] }).data || [];
        if (cancelled) return;
        setSports(s);

        const pairs = await Promise.all(
          s.map(async (sp) => {
            const res = await api.get<{ success: boolean; data: MatchDoc[] }>(
              `/api/matches?sportId=${encodeURIComponent(sp._id)}`
            );
            const list = (res as { data?: MatchDoc[] }).data || [];
            return [sp._id, list] as const;
          })
        );
        if (!cancelled) setMatchesBySport(Object.fromEntries(pairs));
      } catch {
        if (!cancelled) {
          setSports([]);
          setMatchesBySport({});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const onMatchCreated = (m: MatchDoc) => {
      setMatchesBySport((prev) => {
        const arr = prev[m.sport] || [];
        return { ...prev, [m.sport]: [m, ...arr] };
      });
    };
    const onScoreUpdated = (m: MatchDoc) => {
      setMatchesBySport((prev) => {
        const arr = prev[m.sport] || [];
        return { ...prev, [m.sport]: arr.map((x) => (x._id === m._id ? m : x)) };
      });
    };
    socket.on('matchCreated', onMatchCreated);
    socket.on('scoreUpdated', onScoreUpdated);
    return () => {
      socket.off('matchCreated', onMatchCreated);
      socket.off('scoreUpdated', onScoreUpdated);
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Top bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back{ name ? `, ${name}` : '' }! Here's what's happening today.
              </p>
            </div>
            <Link href="/profile">
              <Button variant="outline" className="border-border hover:bg-background bg-transparent">
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-balance">Track Live Scores & Results</h2>
            <p className="text-muted-foreground">Monitor all sports events and get real-time updates</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border hover:border-primary/50 transition">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Live Matches</p>
                    <p className="text-3xl font-bold">{counts.live}</p>
                  </div>
                  <div className="bg-red-500/20 p-3 rounded-lg">
                    <Zap className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                    <p className="text-3xl font-bold">{counts.upcoming}</p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-3xl font-bold">{counts.completed}</p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <Trophy className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sports</p>
                    <p className="text-3xl font-bold">{displaySports.length}</p>
                  </div>
                  <div className="bg-primary/20 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Matches Section */}
          <Card className="bg-card border-border mb-8">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-500" />
                Live Matches
              </CardTitle>
              <CardDescription>Ongoing matches across all sports</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {liveMatches.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center pb-2 border-b border-border/50">
                    Sample matches — your live board updates when the API has matches with status &quot;live&quot;.
                  </p>
                )}
                {liveBoardMatches.map((match) => (
                  <div
                    key={match._id}
                    className="p-5 bg-background rounded-lg border border-border hover:border-primary/50 transition group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">
                        {displaySports.find((s) => s._id === match.sport)?.name ||
                          STATIC_SPORTS.find((s) => s._id === match.sport)?.name ||
                          'Sport'}
                      </p>
                      <div className="flex items-center gap-2">
                        {match.isDemo && (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                            Demo
                          </span>
                        )}
                        <div className="inline-block bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                          LIVE
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-center">
                        <p className="text-sm font-semibold mb-1">{match.teamA?.name}</p>
                        <p className="text-4xl font-bold text-blue-400">{match.scoreA ?? 0}</p>
                      </div>

                      <div className="text-center px-4 py-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {[match.date, match.time].filter(Boolean).join(' ') || 'LIVE'}
                        </p>
                      </div>

                      <div className="flex-1 text-center">
                        <p className="text-sm font-semibold mb-1">{match.teamB?.name}</p>
                        <p className="text-4xl font-bold text-amber-400">{match.scoreB ?? 0}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50">
                      <Link
                        href={`/sport/${match.demoSportSlug || displaySports.find((s) => s._id === match.sport)?.slug || 'cricket'}/live`}
                      >
                        <Button className="w-full bg-primary hover:bg-blue-600 text-white">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Highlights and Quiz Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Highlights Card */}
            <Link href="/highlights">
              <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30 h-full hover:shadow-lg hover:border-orange-500/50 transition cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Latest Highlights</h3>
                      <p className="text-sm text-muted-foreground">Watch the best moments from all sports</p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-500 group-hover:scale-110 transition" />
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-4">
                    Browse Highlights
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Quiz Card */}
            <Link href="/quiz">
              <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30 h-full hover:shadow-lg hover:border-blue-500/50 transition cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Sports Quiz</h3>
                      <p className="text-sm text-muted-foreground">Test your knowledge across all sports</p>
                    </div>
                    <Brain className="w-8 h-8 text-blue-500 group-hover:scale-110 transition" />
                  </div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 mt-4">
                    Take Quiz
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Sports Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              All Sports
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {displaySports.map((s) => {
                const list = matchesBySport[s._id] || [];
                const live = list.filter((m) => (m.status || '').toLowerCase() === 'live').length;
                const upcoming = list.filter((m) => (m.status || '').toLowerCase() === 'upcoming').length;
                const color = SPORT_COLOR[s.slug] || '#64748b';
                return (
                <Link key={s._id} href={`/sport/${s.slug}/live`}>
                  <Card className="bg-card border-border h-full hover:shadow-lg hover:border-primary/50 transition cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition">{s.icon || '🏆'}</div>
                        <h3 className="text-lg font-semibold mb-4">{s.name}</h3>

                        <div className="space-y-3 mb-4">
                          <div className="px-3 py-2 bg-red-500/10 rounded-lg">
                            <p className="text-xs text-muted-foreground">Live</p>
                            <p className="text-xl font-bold text-red-400">{live}</p>
                          </div>
                          <div className="px-3 py-2 bg-blue-500/10 rounded-lg">
                            <p className="text-xs text-muted-foreground">Upcoming</p>
                            <p className="text-xl font-bold text-blue-400">{upcoming}</p>
                          </div>
                        </div>

                        <div
                          className="h-1.5 w-full rounded-full mx-auto"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )})}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
