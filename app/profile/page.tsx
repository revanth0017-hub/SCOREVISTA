'use client';

import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Top bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <Link href="/dashboard">
              <Button variant="outline" className="border-border hover:bg-background gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-8 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Profile Settings</h2>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Profile Picture Section */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <Button className="bg-primary hover:bg-blue-600 text-white mb-2">
                    Upload Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">Max file size: 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="bg-background border-border"
                />
              </div>
              <Button className="bg-primary hover:bg-blue-600 text-white w-full">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-background border-border"
                />
              </div>
              <Button className="bg-primary hover:bg-blue-600 text-white w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
