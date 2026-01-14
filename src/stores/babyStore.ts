// Olive Baby Web - Baby Store (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Baby, BabyStats, RoutineLog } from '../types';
import { babyService, statsService, routineService } from '../services/api';

interface ActiveRoutines {
  feeding?: RoutineLog;
  sleep?: RoutineLog;
  bath?: RoutineLog;
  extraction?: RoutineLog;
}

interface BabyState {
  babies: Baby[];
  selectedBaby: Baby | null;
  stats: BabyStats | null;
  activeRoutines: ActiveRoutines;
  isLoading: boolean;
  
  // Actions
  fetchBabies: () => Promise<void>;
  selectBaby: (baby: Baby | null) => void;
  addBaby: (data: {
    name: string;
    birthDate: string;
    relationship: string;
    birthWeightGrams?: number;
    birthLengthCm?: number;
    city?: string;
    state?: string;
    babyCpf?: string;
  }) => Promise<Baby>;
  updateBaby: (id: number, data: Partial<Baby>) => Promise<void>;
  deleteBaby: (id: number) => Promise<void>;
  fetchStats: (babyId: number, range?: '24h' | '7d' | '30d') => Promise<void>;
  setActiveRoutine: (type: keyof ActiveRoutines, routine: RoutineLog | undefined) => void;
  checkActiveRoutines: (babyId: number) => Promise<void>;
  clearBabyData: () => void;
  restoreSelectedBaby: () => void;
}

export const useBabyStore = create<BabyState>()(
  persist(
    (set, get) => ({
      babies: [],
      selectedBaby: null,
      stats: null,
      activeRoutines: {},
      isLoading: false,

      fetchBabies: async () => {
        const currentState = get();
        
        // Evitar chamadas duplicadas se já está carregando
        if (currentState.isLoading) {
          return;
        }
        
        set({ isLoading: true });
        try {
          const response = await babyService.list();
          if (response.success && response.data) {
            const babies = response.data;
            set({ babies, isLoading: false });
            
            // Sempre garantir que há um bebê selecionado se houver bebês disponíveis
            const { selectedBaby } = get();
            if (babies.length > 0) {
              let babyToSelect: Baby | null = null;
              
              // Se há um bebê selecionado, verificar se ele ainda existe na lista
              if (selectedBaby) {
                const foundBaby = babies.find(b => b.id === selectedBaby.id);
                if (foundBaby) {
                  // Bebê selecionado ainda existe - usar dados atualizados da API
                  babyToSelect = foundBaby;
                }
              }
              
              // Se não encontrou o bebê selecionado, selecionar o primeiro (mais antigo)
              if (!babyToSelect) {
                babyToSelect = babies[0];
              }
              
              // Atualizar seleção e carregar dados
              set({ selectedBaby: babyToSelect });
              get().fetchStats(babyToSelect.id);
              get().checkActiveRoutines(babyToSelect.id);
            } else {
              // Sem bebês - limpar seleção
              set({ selectedBaby: null, stats: null, activeRoutines: {} });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      selectBaby: (baby: Baby | null) => {
        set({ selectedBaby: baby, stats: null, activeRoutines: {} });
        if (baby) {
          get().fetchStats(baby.id);
          get().checkActiveRoutines(baby.id);
        }
      },

      addBaby: async (data) => {
        set({ isLoading: true });
        try {
          const response = await babyService.create(data);
          if (response.success && response.data) {
            const newBaby = response.data;
            set((state) => ({
              babies: [...state.babies, newBaby],
              selectedBaby: newBaby,
              isLoading: false,
            }));
            // Carregar stats e rotinas ativas do novo bebê
            get().fetchStats(newBaby.id);
            get().checkActiveRoutines(newBaby.id);
            return newBaby;
          }
          throw new Error('Failed to create baby');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateBaby: async (id: number, data: Partial<{
        name?: string;
        birthDate?: string;
        city?: string;
        state?: string;
        birthWeightGrams?: number;
        birthLengthCm?: number;
      }>) => {
        try {
          // Filtrar apenas campos definidos e válidos
          const updatePayload: any = {};
          if (data.name !== undefined && data.name.trim() !== '') updatePayload.name = data.name.trim();
          if (data.birthDate !== undefined) updatePayload.birthDate = data.birthDate;
          if (data.city !== undefined) updatePayload.city = data.city?.trim() || null;
          if (data.state !== undefined) updatePayload.state = data.state?.trim() || null;
          if (data.birthWeightGrams !== undefined && data.birthWeightGrams !== null && !isNaN(data.birthWeightGrams)) {
            updatePayload.birthWeightGrams = data.birthWeightGrams;
          }
          if (data.birthLengthCm !== undefined && data.birthLengthCm !== null && !isNaN(data.birthLengthCm)) {
            updatePayload.birthLengthCm = data.birthLengthCm;
          }

          const response = await babyService.update(id, updatePayload);
          if (response.success && response.data) {
            set((state) => ({
              babies: state.babies.map((b) => (b.id === id ? response.data : b)),
              selectedBaby: state.selectedBaby?.id === id ? response.data : state.selectedBaby,
            }));
          } else {
            throw new Error(response.message || 'Falha ao atualizar bebê');
          }
        } catch (error) {
          throw error;
        }
      },

      deleteBaby: async (id: number) => {
        try {
          await babyService.delete(id);
          set((state) => {
            const newBabies = state.babies.filter((b) => b.id !== id);
            return {
              babies: newBabies,
              selectedBaby: state.selectedBaby?.id === id 
                ? (newBabies[0] || null) 
                : state.selectedBaby,
            };
          });
        } catch (error) {
          throw error;
        }
      },

      fetchStats: async (babyId: number, range = '24h') => {
        try {
          const response = await statsService.get(babyId, range);
          if (response.success && response.data) {
            set({ stats: response.data });
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      },

      setActiveRoutine: (type, routine) => {
        set((state) => ({
          activeRoutines: {
            ...state.activeRoutines,
            [type]: routine,
          },
        }));
      },

      checkActiveRoutines: async (babyId: number) => {
        try {
          // OTIMIZADO: Usar endpoint consolidado (1 request ao invés de 4)
          const response = await routineService.getOpenRoutinesAll(babyId);
          
          if (response.success && response.data) {
            const activeRoutines: ActiveRoutines = {
              feeding: response.data.feeding || undefined,
              sleep: response.data.sleep || undefined,
              bath: response.data.bath || undefined,
              extraction: response.data.extraction || undefined,
            };
            set({ activeRoutines });
          }
        } catch (error) {
          console.error('Error checking active routines:', error);
          // Não propagar erro - apenas logar
        }
      },

      clearBabyData: () => {
        set({
          babies: [],
          selectedBaby: null,
          stats: null,
          activeRoutines: {},
        });
      },

      // Restaura bebê selecionado a partir dos dados persistidos
      // Útil quando a API falha mas temos dados em cache
      restoreSelectedBaby: () => {
        const { babies, selectedBaby } = get();
        
        // Se já tem bebê selecionado e ele existe na lista, não fazer nada
        if (selectedBaby && babies.find(b => b.id === selectedBaby.id)) {
          return;
        }
        
        // Se não tem bebê selecionado mas tem bebês na lista, selecionar o primeiro
        if (!selectedBaby && babies.length > 0) {
          set({ selectedBaby: babies[0] });
          get().checkActiveRoutines(babies[0].id);
        }
      },
    }),
    {
      name: 'olive-baby-data',
      // Persistir bebês e bebê selecionado para fallback
      partialize: (state) => ({
        babies: state.babies,
        selectedBaby: state.selectedBaby,
      }),
      // Callback executado após rehidratação do estado
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restaurar bebê selecionado se necessário
          state.restoreSelectedBaby?.();
        }
      },
    }
  )
);
