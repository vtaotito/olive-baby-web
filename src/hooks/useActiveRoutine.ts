// Olive Baby Web - useActiveRoutine Hook
import { useState, useEffect, useCallback } from 'react';
import { routineService } from '../services/api';
import type { RoutineLog } from '../types';

interface ActiveRoutines {
  feeding: RoutineLog | null;
  sleep: RoutineLog | null;
  bath: RoutineLog | null;
  extraction: RoutineLog | null;
}

interface UseActiveRoutineReturn {
  activeRoutines: ActiveRoutines;
  hasActiveRoutine: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useActiveRoutine(babyId: number | undefined): UseActiveRoutineReturn {
  const [activeRoutines, setActiveRoutines] = useState<ActiveRoutines>({
    feeding: null,
    sleep: null,
    bath: null,
    extraction: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveRoutines = useCallback(async () => {
    if (!babyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Verificar todas as rotinas ativas em paralelo
      const [feedingRes, sleepRes, bathRes, extractionRes] = await Promise.allSettled([
        routineService.getOpenFeeding(babyId),
        routineService.getOpenSleep(babyId),
        routineService.getOpenBath(babyId),
        routineService.getOpenExtraction(babyId),
      ]);

      setActiveRoutines({
        feeding: feedingRes.status === 'fulfilled' && feedingRes.value.data ? feedingRes.value.data : null,
        sleep: sleepRes.status === 'fulfilled' && sleepRes.value.data ? sleepRes.value.data : null,
        bath: bathRes.status === 'fulfilled' && bathRes.value.data ? bathRes.value.data : null,
        extraction: extractionRes.status === 'fulfilled' && extractionRes.value.data ? extractionRes.value.data : null,
      });
    } catch (err) {
      console.error('[useActiveRoutine] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    fetchActiveRoutines();
    
    // Refetch a cada 30 segundos
    const interval = setInterval(fetchActiveRoutines, 30000);
    return () => clearInterval(interval);
  }, [fetchActiveRoutines]);

  const hasActiveRoutine = !!(
    activeRoutines.feeding || 
    activeRoutines.sleep || 
    activeRoutines.bath || 
    activeRoutines.extraction
  );

  return {
    activeRoutines,
    hasActiveRoutine,
    isLoading,
    refetch: fetchActiveRoutines,
  };
}
