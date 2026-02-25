import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface LiveMatchCardProps {
  match: {
    id: string;
    team1: string;
    team2: string;
    score1: string;
    score2: string;
    overs1?: string;
    overs2?: string;
    status: string;
    venue: string;
    startTime: string;
  };
  sport: string;
  featured?: boolean;
}

const statusConfig = {
  live: { 
    color: 'bg-red-500 dark:bg-red-500 text-white dark:text-white', 
    text: '\ud83d\udd34 LIVE', 
    border: 'border-red-500/30', 
    hover: 'hover:border-red-500/50',
    stripe: 'from-red-500 to-red-600'
  },
  completed: { 
    color: 'bg-green-500', 
    text: '\u2713 COMPLETED', 
    border: 'border-green-500/30', 
    hover: 'hover:border-green-500/50',
    stripe: 'from-green-500 to-emerald-500'
  },
  upcoming: { 
    color: 'bg-amber-500', 
    text: '\u23f0 UPCOMING', 
    border: 'border-amber-500/30', 
    hover: 'hover:border-amber-500/50',
    stripe: 'from-amber-500 to-yellow-500'
  },
};

export function LiveMatchCard({ match, sport, featured = false }: LiveMatchCardProps) {
  const config = statusConfig[match.status as keyof typeof statusConfig] || {
    color: 'bg-gray-500',
    text: match.status.toUpperCase(),
    border: 'border-gray-500/30',
    hover: 'hover:border-gray-500/50',
    stripe: 'from-gray-500 to-gray-600'
  };

  if (featured) {
    return (
      <Link href={`/sport/${sport}/match/${match.id}`}>
        <Card className={`bg-card border-2 ${config.border} mb-8 overflow-hidden hover:shadow-xl ${config.hover} transition-all duration-300 cursor-pointer group`}>
          <div className={`h-1.5 bg-gradient-to-r ${config.stripe} ${match.status === 'live' ? 'animate-pulse' : ''}`} />
          <CardContent className="p-6 md:p-8">
            {/* Match Info Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Badge className={`${config.color} text-white px-3 py-1 text-xs font-semibold uppercase ${match.status === 'live' ? 'animate-pulse' : ''}`}>
                  {config.text}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground">
                  \ud83d\udccd {match.venue}
                </span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">\ud83d\udd50 {match.startTime}</span>
            </div>

            {/* Score Section - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Team 1 */}
              <div className="text-center md:text-left space-y-3">
                <p className="text-lg font-bold text-foreground">{match.team1}</p>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-5xl md:text-6xl font-bold text-[var(--sport-primary)] group-hover:scale-105 transition-transform">
                    {match.score1}
                  </span>
                  {match.overs1 && (
                    <span className="text-xl text-muted-foreground font-medium">
                      /{match.overs1}
                    </span>
                  )}
                </div>
                {match.overs1 && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {match.overs1} overs
                  </p>
                )}
              </div>

              {/* VS / Status Center */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className={`${match.status === 'live' ? 'bg-red-500 dark:bg-red-500' : `bg-gradient-to-r ${config.stripe}`} text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg mb-3`}>
                  {match.status === 'live' ? 'LIVE NOW' : match.status.toUpperCase()}
                </div>
                {match.overs1 && <p className="text-sm font-medium text-muted-foreground">Innings 2</p>}
              </div>

              {/* Team 2 */}
              <div className="text-center md:text-right space-y-3">
                <p className="text-lg font-bold text-foreground">{match.team2}</p>
                <div className="flex items-baseline justify-center md:justify-end gap-2">
                  <span className="text-5xl md:text-6xl font-bold text-[var(--sport-primary)] group-hover:scale-105 transition-transform">
                    {match.score2}
                  </span>
                  {match.overs2 && (
                    <span className="text-xl text-muted-foreground font-medium">
                      /{match.overs2}
                    </span>
                  )}
                </div>
                {match.overs2 && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {match.overs2} overs
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Regular match card
  return (
    <Link href={`/sport/${sport}/match/${match.id}`}>
      <Card className={`bg-card border ${config.border} ${config.hover} hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
        <CardContent className="p-5 md:p-6">
          {/* Match Header */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`${config.color} text-white px-3 py-1 text-xs font-semibold`}>
              {config.text}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">\ud83d\udccd {match.venue}</span>
            <span className="text-muted-foreground text-sm">\u2022</span>
            <span className="text-sm font-medium text-muted-foreground">\ud83d\udd50 {match.startTime}</span>
          </div>

          {/* Score Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Team 1 */}
            <div className="space-y-1.5">
              <p className="font-bold text-base text-foreground">{match.team1}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-bold text-[var(--sport-primary)] group-hover:scale-105 transition-transform">
                  {match.score1}
                </p>
                {match.overs1 && (
                  <span className="text-base text-muted-foreground font-medium">/{match.overs1}</span>
                )}
              </div>
              {match.overs1 && (
                <p className="text-xs text-muted-foreground font-medium">{match.overs1} overs</p>
              )}
            </div>

            {/* VS Center */}
            <div className="flex items-center justify-center sm:py-0 py-2">
              <div className="w-12 h-12 rounded-full bg-[var(--sport-primary-muted)] flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--sport-primary)]">VS</span>
              </div>
            </div>

            {/* Team 2 */}
            <div className="space-y-1.5 sm:text-right">
              <p className="font-bold text-base text-foreground">{match.team2}</p>
              <div className="flex items-baseline gap-2 sm:justify-end">
                <p className="text-3xl sm:text-4xl font-bold text-[var(--sport-primary)] group-hover:scale-105 transition-transform">
                  {match.score2}
                </p>
                {match.overs2 && (
                  <span className="text-base text-muted-foreground font-medium">/{match.overs2}</span>
                )}
              </div>
              {match.overs2 && (
                <p className="text-xs text-muted-foreground font-medium">{match.overs2} overs</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
