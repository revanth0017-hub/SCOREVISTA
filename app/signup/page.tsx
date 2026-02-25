'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { api, setToken, setUser } from '@/lib/api';

const SPORTS = [
  'Cricket',
  'Football',
  'Volleyball',
  'Basketball',
  'Kabaddi',
  'Shuttle',
  'Tennis',
];

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'admin';
  sport: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    sport: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCopyCode = () => {
    if (adminCode) {
      navigator.clipboard.writeText(adminCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (form.role === 'admin' && !form.sport) {
      setError('Please select a sport');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (form.role === 'admin') {
        // Admin signup - call backend API
        const res = await api.postJson<{
          success: boolean;
          token: string;
          adminCode: string;
          admin: { id: string; email: string; name: string; sportCategory: string; role: string };
        }>('/api/auth/admin/signup', {
          email: form.email,
          name: form.name,
          password: form.password,
          sportCategory: form.sport,
        });

        if (res.success && res.adminCode && res.token && res.admin) {
          setAdminCode(res.adminCode);
          setToken(res.token);
          setUser(res.admin);
        } else {
          setError('Signup failed. Please try again.');
        }
      } else {
        // User signup - call user registration API
        const res = await api.postJson<{
          success: boolean;
          token: string;
          user: Record<string, unknown>;
        }>('/api/auth/register', {
          email: form.email,
          name: form.name,
          password: form.password,
        });

        if (res.success && res.token && res.user) {
          setToken(res.token);
          setUser(res.user);
          router.push('/dashboard');
        } else {
          setError('Signup failed. Please try again.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin signup success screen
  if (adminCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl">Account Created!</CardTitle>
              <CardDescription>Your admin account is ready</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-background rounded-lg p-4 border border-border space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sport Manager</p>
                <p className="text-lg font-semibold capitalize">{form.sport}</p>
              </div>

              <div className="bg-background rounded-lg p-4 border border-border space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Admin Code</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-center text-lg font-mono font-bold text-primary bg-sidebar/50 p-3 rounded">
                    {adminCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="border-border hover:bg-sidebar bg-transparent"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with team members to allow them to login as admins for {form.sport}
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Save your code!</span> You'll need it to login or add admin members.
                </p>
              </div>

              <Link href="/login" className="block">
                <Button className="w-full bg-primary hover:bg-blue-600 text-white">
                  Login with Code
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Regular signup form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-blue-600 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join the Sports Day Scoreboard community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="bg-card border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="bg-card border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground transition-colors hover:border-primary/50 focus:border-primary focus:outline-none"
                >
                  <option value="user">User (View Scores)</option>
                  <option value="admin">Admin (Manage Sport)</option>
                </select>
              </div>

              {form.role === 'admin' && (
                <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <label className="text-sm font-medium">Select Your Sport</label>
                  <select
                    name="sport"
                    value={form.sport}
                    onChange={handleChange}
                    required={form.role === 'admin'}
                    className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground transition-colors hover:border-primary/50 focus:border-primary focus:outline-none"
                  >
                    <option value="">Select a sport</option>
                    {SPORTS.map((sport) => (
                      <option key={sport} value={sport.toLowerCase()}>
                        {sport}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">You'll manage scores for this sport</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="bg-card border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
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
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-blue-600 font-medium">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
