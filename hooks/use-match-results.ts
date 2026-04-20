'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export interface MatchResult {
  _id: string;
  sport: { slug: string; name: string };
  teamA: { _id: string; name: string };
  teamB: { _id: string; name: string };
  status: 'upcoming' | 'live' | 'completed';
  scoreA?: number;
  scoreB?: number;
  venue?: string;
  date?: string;
  time?: string;
  winner?: string;
  sportScore?: Record<string, unknown>;
}

export function useMatchResults() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all sports first
      const sportsRes = await api.get<{ success: boolean; data: any[] }>('/api/sports');
      const sports = ((sportsRes as any).data || []) as any[];

      if (sports.length === 0) {
        setResults([]);
        return;
      }

      // Fetch completed matches for each sport
      const allResults: MatchResult[] = [];
      for (const sport of sports) {
        try {
          const matchesRes = await api.get<{ success: boolean; data: MatchResult[] }>(
            `/api/matches?sportId=${encodeURIComponent(sport._id)}`
          );
          const matches = ((matchesRes as any).data || []) as MatchResult[];
          
          // Filter only completed matches
          const completed = matches.filter(m => m.status === 'completed');
          allResults.push(...completed);
        } catch (err) {
          console.error(`Failed to fetch matches for sport ${sport.slug}:`, err);
        }
      }

      // Sort by date descending (newest first)
      allResults.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });

      setResults(allResults);
    } catch (err) {
      console.error('Failed to fetch match results:', err);
      setError('Unable to load match results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Real-time sync via Socket.io
  useEffect(() => {
    const socket = getSocket();

    const handleScoreUpdate = (match: MatchResult) => {
      setResults(prev => {
        const existing = prev.find(r => r._id === match._id);
        
        if (match.status === 'completed') {
          // If match just became completed
          if (!existing) {
            // Add new completed match at the beginning
            return [match, ...prev];
          } else {
            // Update existing completed match
            return prev.map(r => (r._id === match._id ? match : r));
          }
        } else if (existing && match.status !== 'completed') {
          // If match was completed but is no longer, remove it
          return prev.filter(r => r._id !== match._id);
        }
        
        return prev;
      });
    };

    const handleMatchCreated = () => {
      // When a new match is created, refetch to ensure we don't miss any completed matches
      fetchResults();
    };

    socket.on('scoreUpdated', handleScoreUpdate);
    socket.on('matchCreated', handleMatchCreated);

    return () => {
      socket.off('scoreUpdated', handleScoreUpdate);
      socket.off('matchCreated', handleMatchCreated);
    };
  }, []);

  return { results, loading, error, refetch: fetchResults };
}
