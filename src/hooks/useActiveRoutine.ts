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
  }, [fetchActiveRoutines]);

  // Polling apenas quando há rotina ativa (evita dependência circular)
  useEffect(() => {
    const hasAnyActive = !!(
      activeRoutines.feeding || 
      activeRoutines.sleep || 
      activeRoutines.bath || 
      activeRoutines.extraction
    );

    if (!hasAnyActive) {
      return; // Não fazer polling se não há rotina ativa
    }

    // Refetch a cada 60 segundos apenas se houver rotina ativa
    const interval = setInterval(() => {
      fetchActiveRoutines();
    }, 60000); // Aumentado para 60 segundos
    
    return () => clearInterval(interval);
  }, [
    activeRoutines.feeding?.id,
    activeRoutines.sleep?.id,
    activeRoutines.bath?.id,
    activeRoutines.extraction?.id,
    fetchActiveRoutines,
  ]);

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
