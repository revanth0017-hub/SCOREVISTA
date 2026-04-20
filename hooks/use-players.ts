import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface PlayerStats {
  runs?: number;
  wickets?: number;
  goals?: number;
  assists?: number;
  points?: number;
  aces?: number;
  fouls?: number;
  raids?: number;
  tackles?: number;
  sets?: number[];
  games?: number[];
}

export interface PlayerData {
  _id: string;
  name: string;
  team: { _id: string; name: string };
  sport: { _id: string; name: string; slug: string };
  number?: number;
  role?: string;
  stats: PlayerStats;
}

interface UsePlayersResult {
  players: PlayerData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch players for a specific team or sport
 * @param sportId - MongoDB ID of the sport (required)
 * @param teamId - MongoDB ID of the team (optional, filters players by team)
 * @returns Players list, loading state, error, and refetch function
 */
export function usePlayers(sportId: string | null, teamId?: string | null): UsePlayersResult {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    if (!sportId) {
      setPlayers([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/players?sportId=${encodeURIComponent(sportId)}`;
      if (teamId) {
        url += `&teamId=${encodeURIComponent(teamId)}`;
      }
      const res = await api.get<{ success: boolean; data: PlayerData[] }>(url);
      const data = (res as { data?: PlayerData[] }).data || [];
      setPlayers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch players';
      setError(message);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [sportId, teamId]);

  return { players, isLoading, error, refetch: fetchPlayers };
}
