'use client';

import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

import { AdminShell } from '@/components/admin-shell';
import { AdminPageHeader } from '@/components/admin-page-header';

const SPORT_EMOJI: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  volleyball: '🏐',
  basketball: '🏀',
  kabaddi: '👥',
  shuttle: '🏸',
  tennis: '🎾',
};

export default function CricketSettingsPage() {
  const pathname = usePathname();
  const sport = pathname.split('/')[2] || 'cricket';
  const sportEmoji = SPORT_EMOJI[sport] || '🏆';

  return (
    <AdminShell>
      <div className="flex flex-col h-full">
        <AdminPageHeader
          icon={sportEmoji}
          title="Cricket Settings"
          description="Configure cricket tournament rules"
        />

        <div className="p-8 space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Sport Configuration</h2>
            <p className="text-muted-foreground">Manage cricket league settings and rules</p>
          </div>

          <div className="max-w-2xl space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Match Settings</CardTitle>
                <CardDescription>Configure default match parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Overs</label>
                  <input type="number" defaultValue="20" className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Team Size</label>
                  <input type="number" defaultValue="11" className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Players to Play</label>
                  <input type="number" defaultValue="8" className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
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
                  <label className="block text-sm font-medium mb-2">Points for Win</label>
                  <input type="number" defaultValue="4" className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Points for Draw</label>
                  <input type="number" defaultValue="2" className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bonus Points</label>
                  <input type="number" defaultValue="1" className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Venues</CardTitle>
                <CardDescription>Manage cricket grounds and fields</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="font-medium">Main Ground</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="font-medium">Secondary Ground</span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
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
      </div>
    </AdminShell>
  );
}
