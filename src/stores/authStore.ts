// Olive Baby Web - Auth Store (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens, Caregiver } from '../types';
import { authService } from '../services/api';
import { storage } from '../lib/utils';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    cpf?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(email, password);
          if (response.success && response.data) {
            const { user, tokens } = response.data;
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
            });
            storage.set('auth_tokens', tokens);
            return user;
          } else {
            throw new Error(response.message || 'Erro ao fazer login');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(data);
          if (response.success && response.data) {
            const { user, tokens } = response.data;
            set({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
            });
            storage.set('auth_tokens', tokens);
          } else {
            throw new Error(response.message || 'Erro ao criar conta');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { tokens } = get();
        try {
          if (tokens?.refreshToken) {
            await authService.logout(tokens.refreshToken);
          }
        } catch {
          // Ignore logout errors
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          storage.remove('auth_tokens');
        }
      },

      refreshTokens: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token');
        }

        try {
          const response = await authService.refresh(tokens.refreshToken);
          if (response.success && response.data) {
            set({ tokens: response.data });
            storage.set('auth_tokens', response.data);
          }
        } catch {
          get().clearAuth();
          throw new Error('Session expired');
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setTokens: (tokens: AuthTokens) => {
        set({ tokens });
        storage.set('auth_tokens', tokens);
      },

      clearAuth: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
        storage.remove('auth_tokens');
      },
    }),
    {
      name: 'olive-baby-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
