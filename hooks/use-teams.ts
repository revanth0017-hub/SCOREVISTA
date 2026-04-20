import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface TeamData {
  _id: string;
  name: string;
  sport: string;
  players: number;
  playerList: Array<{ name: string; role?: string; number?: number }>;
  wins: number;
  losses: number;
  captain?: string;
  description?: string;
}

interface UseTeamsResult {
  teams: TeamData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch teams for a specific sport
 * @param sportId - MongoDB ID of the sport
 * @returns Teams list, loading state, error, and refetch function
 */
export function useTeams(sportId: string | null): UseTeamsResult {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    if (!sportId) {
      setTeams([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: TeamData[] }>(
        `/api/teams?sportId=${encodeURIComponent(sportId)}`
      );
      const data = (res as { data?: TeamData[] }).data || [];
      setTeams(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch teams';
      setError(message);
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [sportId]);

  return { teams, isLoading, error, refetch: fetchTeams };
}
