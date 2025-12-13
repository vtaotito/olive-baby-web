// Olive Baby Web - AI Assistant Store (Zustand)
import { create } from 'zustand';
import type { AiChatSession, AiChatMessage, AiInsight, AiCitation } from '../types';
import { aiService } from '../services/api';

interface AiState {
  // Sessions
  sessions: AiChatSession[];
  currentSession: AiChatSession | null;
  isLoadingSessions: boolean;

  // Messages
  messages: AiChatMessage[];
  isLoadingMessages: boolean;
  isSending: boolean;
  lastCitations: AiCitation[];

  // Insights
  insights: AiInsight[];
  isLoadingInsights: boolean;

  // AI Health
  isAiConfigured: boolean;
  isCheckingHealth: boolean;

  // Error
  error: string | null;

  // Actions - Sessions
  fetchSessions: (babyId?: number) => Promise<void>;
  createSession: (babyId: number, title?: string) => Promise<AiChatSession | null>;
  loadSession: (sessionId: number) => Promise<void>;
  deleteSession: (sessionId: number) => Promise<void>;
  setCurrentSession: (session: AiChatSession | null) => void;

  // Actions - Messages
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;

  // Actions - Insights
  fetchInsights: (babyId: number, refresh?: boolean) => Promise<void>;
  markInsightRead: (insightId: number) => Promise<void>;
  dismissInsight: (insightId: number) => Promise<void>;

  // Actions - Health
  checkHealth: () => Promise<void>;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  sessions: [],
  currentSession: null,
  isLoadingSessions: false,
  messages: [],
  isLoadingMessages: false,
  isSending: false,
  lastCitations: [],
  insights: [],
  isLoadingInsights: false,
  isAiConfigured: false,
  isCheckingHealth: false,
  error: null,
};

export const useAiStore = create<AiState>((set, get) => ({
  ...initialState,

  // ==========================================
  // Sessions
  // ==========================================

  fetchSessions: async (babyId?: number) => {
    set({ isLoadingSessions: true, error: null });
    try {
      const response = await aiService.listSessions(babyId);
      if (response.success) {
        set({ sessions: response.data, isLoadingSessions: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar conversas';
      set({ error: errorMessage, isLoadingSessions: false });
    }
  },

  createSession: async (babyId: number, title?: string) => {
    set({ error: null });
    try {
      const response = await aiService.createSession(babyId, title);
      if (response.success && response.data) {
        const newSession = response.data;
        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSession: newSession,
          messages: [],
          lastCitations: [],
        }));
        return newSession;
      }
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conversa';
      set({ error: errorMessage });
      return null;
    }
  },

  loadSession: async (sessionId: number) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await aiService.getSession(sessionId);
      if (response.success && response.data) {
        const session = response.data;
        set({
          currentSession: session,
          messages: session.messages || [],
          isLoadingMessages: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar conversa';
      set({ error: errorMessage, isLoadingMessages: false });
    }
  },

  deleteSession: async (sessionId: number) => {
    try {
      await aiService.deleteSession(sessionId);
      set(state => ({
        sessions: state.sessions.filter(s => s.id !== sessionId),
        currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        messages: state.currentSession?.id === sessionId ? [] : state.messages,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar conversa';
      set({ error: errorMessage });
    }
  },

  setCurrentSession: (session: AiChatSession | null) => {
    set({
      currentSession: session,
      messages: session?.messages || [],
      lastCitations: [],
    });
  },

  // ==========================================
  // Messages
  // ==========================================

  sendMessage: async (message: string) => {
    const { currentSession } = get();
    if (!currentSession) {
      set({ error: 'Nenhuma conversa selecionada' });
      return;
    }

    set({ isSending: true, error: null });

    // Optimistic update - add user message
    const optimisticUserMessage: AiChatMessage = {
      id: Date.now(),
      sessionId: currentSession.id,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      messages: [...state.messages, optimisticUserMessage],
    }));

    try {
      const response = await aiService.sendMessage(currentSession.id, message);
      
      if (response.success && response.data) {
        const { userMessage, assistantMessage, citations } = response.data;

        set(state => ({
          messages: [
            ...state.messages.filter(m => m.id !== optimisticUserMessage.id),
            userMessage,
            assistantMessage,
          ],
          lastCitations: citations,
          isSending: false,
        }));
      }
    } catch (error: any) {
      // Remove optimistic message on error
      set(state => ({
        messages: state.messages.filter(m => m.id !== optimisticUserMessage.id),
        isSending: false,
        error: error.response?.data?.error || error.message || 'Erro ao enviar mensagem',
      }));
    }
  },

  clearMessages: () => {
    set({ messages: [], lastCitations: [] });
  },

  // ==========================================
  // Insights
  // ==========================================

  fetchInsights: async (babyId: number, refresh = false) => {
    set({ isLoadingInsights: true, error: null });
    try {
      const response = await aiService.getInsights(babyId, { refresh });
      if (response.success) {
        set({ insights: response.data, isLoadingInsights: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar insights';
      set({ error: errorMessage, isLoadingInsights: false });
    }
  },

  markInsightRead: async (insightId: number) => {
    try {
      await aiService.markInsightRead(insightId);
      set(state => ({
        insights: state.insights.map(i =>
          i.id === insightId ? { ...i, isRead: true } : i
        ),
      }));
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  },

  dismissInsight: async (insightId: number) => {
    try {
      await aiService.dismissInsight(insightId);
      set(state => ({
        insights: state.insights.filter(i => i.id !== insightId),
      }));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  },

  // ==========================================
  // Health
  // ==========================================

  checkHealth: async () => {
    set({ isCheckingHealth: true });
    try {
      const response = await aiService.healthCheck();
      if (response.success && response.data) {
        set({
          isAiConfigured: response.data.openaiConfigured,
          isCheckingHealth: false,
        });
      }
    } catch (error) {
      set({ isAiConfigured: false, isCheckingHealth: false });
    }
  },

  // ==========================================
  // Reset
  // ==========================================

  reset: () => {
    set(initialState);
  },
}));
