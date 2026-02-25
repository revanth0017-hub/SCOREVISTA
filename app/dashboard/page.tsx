'use client';

import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Trophy, TrendingUp, Users, Zap, Flame, Brain } from 'lucide-react';

const SPORTS = [
  {
    name: 'Cricket',
    icon: '🏏',
    color: '#059669',
    matches: 3,
    upcoming: 2,
    href: '/sport/cricket/live',
  },
  {
    name: 'Football',
    icon: '⚽',
    color: '#1D4ED8',
    matches: 2,
    upcoming: 1,
    href: '/sport/football/live',
  },
  {
    name: 'Volleyball',
    icon: '🏐',
    color: '#EA580C',
    matches: 4,
    upcoming: 3,
    href: '/sport/volleyball/live',
  },
  {
    name: 'Basketball',
    icon: '🏀',
    color: '#C2410C',
    matches: 2,
    upcoming: 2,
    href: '/sport/basketball/live',
  },
  {
    name: 'Kabaddi',
    icon: '👥',
    color: '#7F1D1D',
    matches: 1,
    upcoming: 1,
    href: '/sport/kabaddi/live',
  },
  {
    name: 'Shuttle',
    icon: '🏸',
    color: '#0F766E',
    matches: 2,
    upcoming: 2,
    href: '/sport/shuttle/live',
  },
  {
    name: 'Tennis',
    icon: '🎾',
    color: '#65A30D',
    matches: 1,
    upcoming: 1,
    href: '/sport/tennis/live',
  },
];

const LIVE_MATCHES = [
  {
    id: 1,
    sport: 'Cricket',
    team1: 'Team A',
    team2: 'Team B',
    score1: 142,
    score2: 89,
    status: 'live',
    time: 'Innings 2 - Over 12',
  },
  {
    id: 2,
    sport: 'Football',
    team1: 'Eagles',
    team2: 'Lions',
    score1: 2,
    score2: 1,
    status: 'live',
    time: '45\' - HT',
  },
  {
    id: 3,
    sport: 'Volleyball',
    team1: 'Team X',
    team2: 'Team Y',
    score1: 2,
    score2: 1,
    status: 'live',
    time: 'Set 3 - 15:18',
  },
];

export default function DashboardPage() {
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
              <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening today.</p>
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
                    <p className="text-3xl font-bold">3</p>
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
                    <p className="text-3xl font-bold">12</p>
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
                    <p className="text-3xl font-bold">24</p>
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
                    <p className="text-3xl font-bold">7</p>
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
                {LIVE_MATCHES.map((match) => (
                  <div
                    key={match.id}
                    className="p-5 bg-background rounded-lg border border-border hover:border-primary/50 transition group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">{match.sport}</p>
                      <div className="inline-block bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                        LIVE
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-center">
                        <p className="text-sm font-semibold mb-1">{match.team1}</p>
                        <p className="text-4xl font-bold text-blue-400">{match.score1}</p>
                      </div>

                      <div className="text-center px-4 py-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{match.time}</p>
                      </div>

                      <div className="flex-1 text-center">
                        <p className="text-sm font-semibold mb-1">{match.team2}</p>
                        <p className="text-4xl font-bold text-amber-400">{match.score2}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50">
                      <Link href={`/sport/${match.sport.toLowerCase()}/live`}>
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
              {SPORTS.map((sport) => (
                <Link key={sport.name} href={sport.href}>
                  <Card className="bg-card border-border h-full hover:shadow-lg hover:border-primary/50 transition cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-5xl mb-3 group-hover:scale-110 transition">{sport.icon}</div>
                        <h3 className="text-lg font-semibold mb-4">{sport.name}</h3>

                        <div className="space-y-3 mb-4">
                          <div className="px-3 py-2 bg-red-500/10 rounded-lg">
                            <p className="text-xs text-muted-foreground">Live</p>
                            <p className="text-xl font-bold text-red-400">{sport.matches}</p>
                          </div>
                          <div className="px-3 py-2 bg-blue-500/10 rounded-lg">
                            <p className="text-xs text-muted-foreground">Upcoming</p>
                            <p className="text-xl font-bold text-blue-400">{sport.upcoming}</p>
                          </div>
                        </div>

                        <div
                          className="h-1.5 w-full rounded-full mx-auto"
                          style={{ backgroundColor: sport.color }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
