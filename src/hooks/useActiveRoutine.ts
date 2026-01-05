// Olive Baby Web - useActiveRoutine Hook
// Otimizado: usa endpoint consolidado /open-all (1 request ao invés de 4)
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
      // OTIMIZADO: Usar endpoint consolidado (1 request ao invés de 4)
      const response = await routineService.getOpenRoutinesAll(babyId);
      
      if (response.success && response.data) {
        setActiveRoutines({
          feeding: response.data.feeding || null,
          sleep: response.data.sleep || null,
          bath: response.data.bath || null,
          extraction: response.data.extraction || null,
        });
      }
    } catch (err) {
      console.error('[useActiveRoutine] Error:', err);
      // Fallback: se o novo endpoint falhar, resetar rotinas
      setActiveRoutines({
        feeding: null,
        sleep: null,
        bath: null,
        extraction: null,
      });
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

    if (!hasAnyActive || !babyId) {
      return; // Não fazer polling se não há rotina ativa ou babyId
    }

    // Refetch a cada 60 segundos apenas se houver rotina ativa
    // Intervalo otimizado para reduzir carga no servidor
    const interval = setInterval(() => {
      fetchActiveRoutines();
    }, 60000); // 60 segundos - balance entre atualização e performance
    
    return () => clearInterval(interval);
  }, [
    activeRoutines.feeding?.id,
    activeRoutines.sleep?.id,
    activeRoutines.bath?.id,
    activeRoutines.extraction?.id,
    babyId,
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
