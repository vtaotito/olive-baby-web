import { useState, useEffect, useCallback, useRef } from 'react';
import { statsService } from '../services/api';
import type { BabyStats } from '../types';

export interface StatsHistory {
  labels: string[];
  sleepHours: number[];
  feedingCounts: number[];
  feedingMinutes: number[];
  diaperCounts: number[];
  diaperWetCounts: number[];
  diaperDirtyCounts: number[];
  bathCounts: number[];
  extractionMl: number[];
  bottleMl: number[];
  complementMl: number[];
}

interface UseStatsReturn {
  stats: BabyStats | null;
  history: StatsHistory | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStats(
  babyId: number | undefined,
  range: '24h' | '7d' | '30d' = '24h',
  historyRange: '7d' | '14d' | '30d' = '7d'
): UseStatsReturn {
  const [stats, setStats] = useState<BabyStats | null>(null);
  const [history, setHistory] = useState<StatsHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!babyId) {
      setIsLoading(false);
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, historyResponse] = await Promise.all([
        statsService.getStats(babyId, range),
        statsService.getHistory(babyId, historyRange),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (historyResponse.success && historyResponse.data) {
        const data = historyResponse.data;
        setHistory({
          labels: data.labels || [],
          sleepHours: data.sleep_hours || [],
          feedingCounts: data.feeding_counts || [],
          feedingMinutes: data.feeding_minutes || [],
          diaperCounts: data.diaper_counts || [],
          diaperWetCounts: data.diaper_wet_counts || [],
          diaperDirtyCounts: data.diaper_dirty_counts || [],
          bathCounts: data.bath_counts || [],
          extractionMl: data.extraction_ml || [],
          bottleMl: data.bottle_ml || [],
          complementMl: data.complement_ml || [],
        });
      }
    } catch (err) {
      console.error('[useStats] Error:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [babyId, range, historyRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    history,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
