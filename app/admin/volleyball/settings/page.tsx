'use client';

import { AdminSidebar } from '@/components/admin-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

export default function VolleyballSettingsPage() {
  const sport = 'volleyball';
  const sportEmoji = SPORT_EMOJI[sport] || '🏆';

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar sport={sport} sportIcon={sportEmoji} />

      <main className="flex-1 ml-64 overflow-auto bg-background">
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏐</span>
            <div>
              <h1 className="text-2xl font-bold">Volleyball Settings</h1>
              <p className="text-xs text-muted-foreground">Configure volleyball match settings</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Sport Configuration</h2>
            <p className="text-muted-foreground">Manage volleyball league settings and rules</p>
          </div>

          <div className="max-w-2xl space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Match Settings</CardTitle>
                <CardDescription>Configure default match parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sets Per Match</label>
                  <input type="number" defaultValue={5} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Points Per Set</label>
                  <input type="number" defaultValue={25} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Team Size</label>
                  <input type="number" defaultValue={6} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Scoring Rules</CardTitle>
                <CardDescription>Set up point system for matches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Win By (points)</label>
                  <input type="number" defaultValue={2} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Final Set Points</label>
                  <input type="number" defaultValue={15} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
