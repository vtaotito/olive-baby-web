// Olive Baby Web - Modal Store (Zustand)
// Gerencia estado global de modais para evitar prop drilling
import { create } from 'zustand';
import type { Baby } from '../types';

interface ModalState {
  // Baby Modal
  babyModalOpen: boolean;
  editingBaby: Baby | null;
  
  // Actions
  openBabyModal: (baby?: Baby | null) => void;
  closeBabyModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  babyModalOpen: false,
  editingBaby: null,
  
  openBabyModal: (baby = null) => {
    set({ babyModalOpen: true, editingBaby: baby });
  },
  
  closeBabyModal: () => {
    set({ babyModalOpen: false, editingBaby: null });
  },
}));
