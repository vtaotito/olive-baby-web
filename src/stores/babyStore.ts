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
        set({ isLoading: true });
        try {
          const response = await babyService.list();
          if (response.success && response.data) {
            const babies = response.data;
            set({ babies, isLoading: false });
            
            // Auto-select first baby if none selected
            const { selectedBaby } = get();
            if (!selectedBaby && babies.length > 0) {
              set({ selectedBaby: babies[0] });
            }
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
            return newBaby;
          }
          throw new Error('Failed to create baby');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateBaby: async (id: number, data: Partial<Baby>) => {
        try {
          const response = await babyService.update(id, {
            name: data.name,
            birthDate: data.birthDate,
            city: data.city,
            state: data.state,
            birthWeightGrams: data.birthWeightGrams,
            birthLengthCm: data.birthLengthCm,
          });
          if (response.success && response.data) {
            set((state) => ({
              babies: state.babies.map((b) => (b.id === id ? response.data : b)),
              selectedBaby: state.selectedBaby?.id === id ? response.data : state.selectedBaby,
            }));
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
        const routineTypes = ['feeding', 'sleep', 'bath', 'extraction'] as const;
        
        const activeRoutines: ActiveRoutines = {};
        
        for (const type of routineTypes) {
          try {
            const response = await routineService.getActive(babyId, type);
            if (response.success && response.data) {
              activeRoutines[type] = response.data;
            }
          } catch {
            // No active routine for this type
          }
        }
        
        set({ activeRoutines });
      },

      clearBabyData: () => {
        set({
          babies: [],
          selectedBaby: null,
          stats: null,
          activeRoutines: {},
        });
      },
    }),
    {
      name: 'olive-baby-data',
      partialize: (state) => ({
        selectedBaby: state.selectedBaby,
      }),
    }
  )
);
