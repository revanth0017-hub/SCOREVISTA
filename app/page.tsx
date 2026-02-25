'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, Trophy, Users, TrendingUp, Star, Lock, CloudLightning as Lightning } from 'lucide-react';

const SPORTS = [
  { name: 'Cricket', icon: '🏏', color: '#059669' },
  { name: 'Football', icon: '⚽', color: '#1D4ED8' },
  { name: 'Volleyball', icon: '🏐', color: '#EA580C' },
  { name: 'Basketball', icon: '🏀', color: '#C2410C' },
  { name: 'Kabaddi', icon: '👥', color: '#7F1D1D' },
  { name: 'Shuttle', icon: '🏸', color: '#0F766E' },
  { name: 'Tennis', icon: '🎾', color: '#65A30D' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            <div className="text-2xl font-bold">ScoreVista</div>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sidebar-foreground hover:text-sidebar-primary">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-sidebar-primary hover:bg-blue-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 py-32 px-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-sm font-semibold text-white">🎯 The Ultimate Sports Tracking Platform</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance leading-tight">
            Live Sports Scores, <span className="text-blue-200">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto text-balance leading-relaxed">
            Track live matches across 7 sports, manage teams effortlessly, and never miss a moment. Built for schools and sports enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button size="lg" className="bg-white hover:bg-blue-50 text-blue-700 font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all">
                View Live Scores
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-6 text-lg rounded-lg border-2 border-white/30 shadow-lg hover:shadow-xl transition-all">
                Become an Admin
              </Button>
            </Link>
          </div>
          <p className="text-blue-100 text-sm">No credit card required. Start in seconds.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to manage sports scores effectively</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-xl p-8 border border-border hover:shadow-xl hover:border-blue-500/50 transition group">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/20 mb-6 group-hover:bg-blue-500/30 transition">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Real-Time Updates</h3>
              <p className="text-muted-foreground leading-relaxed">Live score updates, instant notifications, and match tracking as it happens</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border hover:shadow-xl hover:border-green-500/50 transition group">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-500/20 mb-6 group-hover:bg-green-500/30 transition">
                <Trophy className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">7 Sports Supported</h3>
              <p className="text-muted-foreground leading-relaxed">Cricket, Football, Volleyball, Basketball, Kabaddi, Badminton, Tennis</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border hover:shadow-xl hover:border-purple-500/50 transition group">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/20 mb-6 group-hover:bg-purple-500/30 transition">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Team Management</h3>
              <p className="text-muted-foreground leading-relaxed">Organize teams, manage players, and track statistics all in one place</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border hover:shadow-xl hover:border-orange-500/50 transition group">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/20 mb-6 group-hover:bg-orange-500/30 transition">
                <TrendingUp className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Analytics & Insights</h3>
              <p className="text-muted-foreground leading-relaxed">Detailed statistics, performance trends, and comprehensive reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Grid */}
      <section className="py-32 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4">All Your Favorite Sports</h2>
            <p className="text-xl text-muted-foreground">From cricket to tennis, we cover it all</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {SPORTS.map((sport) => (
              <div
                key={sport.name}
                className="bg-background rounded-xl p-6 border border-border hover:shadow-lg hover:border-blue-500/50 transition text-center cursor-pointer group"
              >
                <div className="text-5xl mb-3 group-hover:scale-120 transition inline-block">{sport.icon}</div>
                <h3 className="font-semibold text-sm">{sport.name}</h3>
                <div
                  className="h-1.5 w-8 mx-auto rounded-full mt-3 group-hover:w-full transition-all"
                  style={{ backgroundColor: sport.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full filter blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Sports Experience?</h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Join schools and sports enthusiasts managing scores in real-time. Get started in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white hover:bg-blue-50 text-blue-700 font-semibold px-10 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all">
                View Scores Now
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-10 py-6 text-lg rounded-lg border-2 border-white/30 shadow-lg hover:shadow-xl transition-all">
                Create Admin Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border text-center py-8 text-muted-foreground">
        <p>&copy; 2024 Sports Day Scoreboard. All rights reserved.</p>
      </footer>
    </div>
  );
}
