'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { api, setToken, setUser } from '@/lib/api';

type LoginMode = 'regular' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('regular');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!adminPassword) {
      setError('Please enter your password');
      return;
    }
    if (!adminCode.trim()) {
      setError('Please enter your admin code');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.postJson<{ success: boolean; token: string; admin?: { sportCategory: string; name: string; email: string } }>(
        '/api/auth/admin/login',
        { 
          email: adminEmail.trim(),
          password: adminPassword,
          adminCode: adminCode.trim().toUpperCase() 
        }
      );
      const token = (res as { token?: string }).token;
      const admin = (res as { admin?: { sportCategory: string } }).admin;
      if (token && admin) {
        setToken(token);
        setUser({ ...admin, role: 'admin' });
        router.push(`/admin/dashboard?sport=${admin.sportCategory}`);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.postJson<{ token: string; user: Record<string, unknown> }>(
        '/api/auth/login',
        { email, password }
      );
      const token = (res as { token?: string }).token;
      const user = (res as { user?: Record<string, unknown> }).user;
      if (token && user) {
        setToken(token);
        setUser(user);
        router.push('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'regular') {
      handleRegularSubmit(e);
    } else {
      handleCodeLogin(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-blue-600 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access the scoreboard</CardDescription>

            {/* Mode Toggle */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={mode === 'regular' ? 'default' : 'outline'}
                onClick={() => {
                  setMode('regular');
                  setError(null);
                }}
                className="flex-1"
              >
                Regular Login
              </Button>
              <Button
                variant={mode === 'code' ? 'default' : 'outline'}
                onClick={() => {
                  setMode('code');
                  setError(null);
                }}
                className="flex-1"
              >
                Admin Code
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Regular Login */}
            {mode === 'regular' && (
              <form onSubmit={handleRegularSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-blue-600 text-white disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            )}

            {/* Admin Code Login */}
            {mode === 'code' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Code</label>
                  <Input
                    type="text"
                    placeholder="e.g., CRICKET-ABC123XYZ"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                    required
                    className="bg-card border-border font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the code you received when you created your admin account
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-blue-600 text-white disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-blue-600 font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
