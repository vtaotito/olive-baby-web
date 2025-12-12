// Olive Baby Web - useRoutineHistory Hook
import { useState, useEffect, useCallback } from 'react';
import { routineService } from '../services/api';
import type { RoutineLog, RoutineType } from '../types';

interface UseRoutineHistoryReturn {
  routines: RoutineLog[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface FilterOptions {
  type?: RoutineType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useRoutineHistory(
  babyId: number | undefined,
  filters: FilterOptions = {}
): UseRoutineHistoryReturn {
  const [routines, setRoutines] = useState<RoutineLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(async () => {
    if (!babyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await routineService.list(babyId, {
        type: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit || 50,
      });

      if (response.success && response.data) {
        setRoutines(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('[useRoutineHistory] Error:', err);
      setError('Erro ao carregar rotinas');
    } finally {
      setIsLoading(false);
    }
  }, [babyId, filters.type, filters.startDate, filters.endDate, filters.limit]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  return {
    routines,
    isLoading,
    error,
    refetch: fetchRoutines,
  };
}
