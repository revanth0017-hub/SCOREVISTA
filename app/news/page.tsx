'use client';

import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Cricket Tournament Finals Scheduled',
    excerpt: 'The grand finals of the cricket tournament will be held on February 15th at the main ground.',
    sport: 'Cricket',
    date: '2024-02-01',
    category: 'Announcement',
  },
  {
    id: 2,
    title: 'Football League Winners Crowned',
    excerpt: 'Congratulations to the Strikers for winning the football league championship!',
    sport: 'Football',
    date: '2024-02-01',
    category: 'Results',
  },
  {
    id: 3,
    title: 'Volleyball Team Dominates Regional Competition',
    excerpt: 'The volleyball team showed excellent performance in the regional competition.',
    sport: 'Volleyball',
    date: '2024-01-31',
    category: 'Highlights',
  },
  {
    id: 4,
    title: 'Basketball Training Session This Weekend',
    excerpt: 'All basketball players are requested to attend the training session on Saturday.',
    sport: 'Basketball',
    date: '2024-01-31',
    category: 'Announcement',
  },
  {
    id: 5,
    title: 'Shuttle Championship Qualifiers Announced',
    excerpt: 'The list of qualified players for the shuttle championship has been announced.',
    sport: 'Shuttle',
    date: '2024-01-30',
    category: 'News',
  },
];

export default function NewsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto bg-background">
        {/* Top bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10 px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold">News & Updates</h1>
            <p className="text-xs text-muted-foreground">Latest news from all sports</p>
          </div>
        </div>

        <div className="p-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Latest News</h2>
            <p className="text-muted-foreground">Stay updated with announcements and highlights</p>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8 overflow-x-auto">
            <Badge className="bg-primary/20 text-primary cursor-pointer">All News</Badge>
            <Badge variant="outline" className="cursor-pointer">Announcements</Badge>
            <Badge variant="outline" className="cursor-pointer">Results</Badge>
            <Badge variant="outline" className="cursor-pointer">Highlights</Badge>
          </div>

          {/* News List */}
          <div className="space-y-6">
            {NEWS_ITEMS.map((item) => (
              <Card key={item.id} className="bg-card border-border hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                      <Badge className="bg-primary/20 text-primary text-xs">{item.sport}</Badge>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                  <Button variant="outline" className="border-primary text-primary bg-transparent">
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
