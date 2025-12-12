// Olive Baby Web - useStats Hook
import { useState, useEffect, useCallback } from 'react';
import { statsService } from '../services/api';
import type { BabyStats } from '../types';

interface StatsHistory {
  labels: string[];
  sleepHours: number[];
  feedingCounts: number[];
  feedingMinutes: number[];
  diaperCounts: number[];
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

export function useStats(babyId: number | undefined, range: '24h' | '7d' | '30d' = '24h'): UseStatsReturn {
  const [stats, setStats] = useState<BabyStats | null>(null);
  const [history, setHistory] = useState<StatsHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!babyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buscar stats atuais
      const statsResponse = await statsService.getStats(babyId, range);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Buscar histórico para gráficos (últimos 7 dias)
      const historyResponse = await statsService.getHistory(babyId, '7d');
      if (historyResponse.success && historyResponse.data) {
        // Processar dados do histórico para os gráficos
        const data = historyResponse.data;
        setHistory({
          labels: data.labels || [],
          sleepHours: data.sleep_hours || [],
          feedingCounts: data.feeding_counts || [],
          feedingMinutes: data.feeding_minutes || [],
          diaperCounts: data.diaper_counts || [],
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
    }
  }, [babyId, range]);

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
