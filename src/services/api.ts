// Olive Baby Web - API Service
import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../lib/utils';
import type { AuthTokens, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Generate UUID with fallback for browsers that don't support crypto.randomUUID
function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers with secure context)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback: generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Create axios instance com configurações otimizadas
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Configurações para evitar requisições duplicadas
  validateStatus: (status) => status < 500, // Não rejeitar automaticamente 4xx
});

// Request interceptor - add auth token and correlation ID
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const tokens = storage.get<AuthTokens>('auth_tokens');
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    
    // Add correlation ID for request tracing
    const correlationId = generateUUID();
    config.headers['x-correlation-id'] = correlationId;
    
    // Log request in development for debugging
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url} [${correlationId.slice(0, 8)}...]`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh com proteção contra loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Emitir evento customizado quando tokens são atualizados
// Isso permite que o authStore seja sincronizado
const emitTokensUpdated = (tokens: AuthTokens) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth:tokens-updated', { detail: tokens });
    window.dispatchEvent(event);
  }
};

// Emitir evento de sessão expirada para navegação elegante
const emitSessionExpired = () => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth:session-expired');
    window.dispatchEvent(event);
  }
};

// Lista de endpoints públicos que não precisam de autenticação
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/professionals/verify-token',
  '/professionals/activate',
  '/invites/verify-token',
  '/invites/accept',
];

const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean;
      _skipAuth?: boolean;
    };

    // Skip refresh para endpoints públicos
    if (!originalRequest || isPublicEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Se já está fazendo refresh, adicionar à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = storage.get<AuthTokens>('auth_tokens');
        if (tokens?.refreshToken) {
          // Try to refresh token
          const response = await axios.post<ApiResponse<AuthTokens>>(
            `${API_URL}/auth/refresh`,
            { refreshToken: tokens.refreshToken },
            { timeout: 10000 } // Timeout de 10s para refresh
          );

          if (response.data.success && response.data.data) {
            const newTokens = response.data.data;
            
            // Save new tokens
            storage.set('auth_tokens', newTokens);
            
            // Emitir evento para sincronizar com authStore
            emitTokensUpdated(newTokens);
            
            // Processar fila de requisições pendentes
            processQueue(null, newTokens.accessToken);
            
            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            }
            isRefreshing = false;
            return api(originalRequest);
          }
        }
        
        // Se não conseguiu refresh, limpar e redirecionar
        throw new Error('Token refresh failed');
      } catch (refreshError) {
        // Refresh failed - processar fila com erro
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear auth storage
        storage.remove('auth_tokens');
        storage.remove('user');
        
        // Emitir evento de sessão expirada (permite navegação elegante via React Router)
        emitSessionExpired();
        
        // Fallback: redirecionar via window.location se o evento não foi tratado
        // Aguardar um pequeno delay para dar chance ao handler de evento
        setTimeout(() => {
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }, 100);
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ====== Auth Service ======
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    cpf: string;
    phone?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  deleteAccount: async (password: string) => {
    const response = await api.delete('/auth/account', { data: { password } });
    return response.data;
  },
};

// ====== Baby Service ======
export const babyService = {
  list: async () => {
    const response = await api.get('/babies');
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get(`/babies/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    birthDate: string;
    relationship: string;
    birthWeightGrams?: number;
    birthLengthCm?: number;
    city?: string;
    state?: string;
    babyCpf?: string;
  }) => {
    const response = await api.post('/babies', data);
    return response.data;
  },

  update: async (id: number, data: Partial<{
    name: string;
    birthDate: string;
    city: string;
    state: string;
    birthWeightGrams?: number;
    birthLengthCm?: number;
  }>) => {
    const response = await api.patch(`/babies/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/babies/${id}`);
    return response.data;
  },
};

// ====== Routine Service ======
export const routineService = {
  // ============================================
  // Verificar Rotina Aberta (Novo Fluxo)
  // ============================================
  
  // Verifica qualquer rotina aberta
  getOpenRoutine: async (babyId: number, routineType: 'FEEDING' | 'SLEEP' | 'BATH') => {
    const response = await api.get('/routines/open', { 
      params: { babyId, routineType } 
    });
    return response.data;
  },

  // Verifica se há feeding aberto
  getOpenFeeding: async (babyId: number) => {
    const response = await api.get('/routines/feeding/open', { 
      params: { babyId } 
    });
    return response.data;
  },

  // Verifica se há sleep aberto
  getOpenSleep: async (babyId: number) => {
    const response = await api.get('/routines/sleep/open', { 
      params: { babyId } 
    });
    return response.data;
  },

  // Verifica se há bath aberto
  getOpenBath: async (babyId: number) => {
    const response = await api.get('/routines/bath/open', { 
      params: { babyId } 
    });
    return response.data;
  },

  // Verifica se há extraction aberto
  getOpenExtraction: async (babyId: number) => {
    const response = await api.get('/routines/extraction/open', { 
      params: { babyId } 
    });
    return response.data;
  },

  // ============================================
  // Endpoint Consolidado - Todas as Rotinas Abertas
  // Otimização: 1 request ao invés de 4 paralelas
  // ============================================
  getOpenRoutinesAll: async (babyId: number) => {
    const response = await api.get('/routines/open-all', { 
      params: { babyId } 
    });
    return response.data;
  },

  // ============================================
  // Feeding
  // ============================================
  startFeeding: async (babyId: number, meta: Record<string, unknown>) => {
    const response = await api.post('/routines/feeding/start', { babyId, meta });
    return response.data;
  },

  closeFeeding: async (babyId: number, meta?: Record<string, unknown>, notes?: string) => {
    const response = await api.post('/routines/feeding/close', { babyId, meta, notes });
    return response.data;
  },

  // ============================================
  // Sleep
  // ============================================
  startSleep: async (babyId: number, meta?: Record<string, unknown>) => {
    const response = await api.post('/routines/sleep/start', { babyId, meta });
    return response.data;
  },

  closeSleep: async (babyId: number, meta?: Record<string, unknown>, notes?: string) => {
    const response = await api.post('/routines/sleep/close', { babyId, meta, notes });
    return response.data;
  },

  // ============================================
  // Diaper (instant)
  // ============================================
  registerDiaper: async (babyId: number, meta: Record<string, unknown>, notes?: string) => {
    const response = await api.post('/routines/diaper', { babyId, meta, notes });
    return response.data;
  },

  // ============================================
  // Bath
  // ============================================
  startBath: async (babyId: number, meta?: Record<string, unknown>) => {
    const response = await api.post('/routines/bath/start', { babyId, meta });
    return response.data;
  },

  closeBath: async (babyId: number, meta?: Record<string, unknown>, notes?: string) => {
    const response = await api.post('/routines/bath/close', { babyId, meta, notes });
    return response.data;
  },

  // ============================================
  // Milk Extraction
  // ============================================
  startExtraction: async (babyId: number, meta?: Record<string, unknown>) => {
    const response = await api.post('/routines/extraction/start', { babyId, meta });
    return response.data;
  },

  closeExtraction: async (babyId: number, meta?: Record<string, unknown>, notes?: string) => {
    const response = await api.post('/routines/extraction/close', { babyId, meta, notes });
    return response.data;
  },

  // ============================================
  // Helpers
  // ============================================
  
  // Get active routine (deprecated - use getOpenXXX)
  getActive: async (babyId: number, routineType: string) => {
    const response = await api.get(`/routines/${routineType}/active/${babyId}`);
    return response.data;
  },

  // List routines
  list: async (babyId: number, params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/routines/${babyId}`, { params });
    return response.data;
  },

  // Get history (alias for list with better params)
  getHistory: async (babyId: number, params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/routines/${babyId}`, { params });
    return response.data;
  },

  // Get single routine
  get: async (routineId: number) => {
    const response = await api.get(`/routines/log/${routineId}`);
    return response.data;
  },

  // Update routine
  update: async (routineId: number, data: {
    startTime?: string;
    endTime?: string;
    notes?: string;
    meta?: Record<string, unknown>;
  }) => {
    const response = await api.patch(`/routines/log/${routineId}`, data);
    return response.data;
  },

  // Delete routine
  delete: async (routineId: number) => {
    const response = await api.delete(`/routines/log/${routineId}`);
    return response.data;
  },
};

// ====== Stats Service ======
export const statsService = {
  getStats: async (babyId: number, range: '24h' | '7d' | '30d' = '24h') => {
    const response = await api.get(`/stats/${babyId}`, { params: { range } });
    return response.data;
  },

  // Alias para manter compatibilidade
  get: async (babyId: number, range: '24h' | '7d' | '30d' = '24h') => {
    const response = await api.get(`/stats/${babyId}`, { params: { range } });
    return response.data;
  },

  // Histórico agregado para gráficos (últimos N dias)
  getHistory: async (babyId: number, range: '7d' | '14d' | '30d' = '7d') => {
    const response = await api.get(`/stats/${babyId}/history`, { params: { range } });
    return response.data;
  },

  // Histórico por tipo específico
  getHistoryByType: async (babyId: number, type: string, days: number = 7) => {
    const response = await api.get(`/stats/${babyId}/history/${type}`, { params: { days } });
    return response.data;
  },

  // Volumetria por tipo de leite (Leite Materno, Fórmula, Misto)
  getVolumeByType: async (babyId: number, range: '7d' | '14d' | '30d' = '7d') => {
    const response = await api.get(`/stats/${babyId}/volume-by-type`, { params: { range } });
    return response.data;
  },
};

// ====== Growth Service ======
export const growthService = {
  getAll: async (babyId: number) => {
    const response = await api.get(`/babies/${babyId}/growth`);
    return response.data;
  },

  get: async (babyId: number, growthId: number) => {
    const response = await api.get(`/babies/${babyId}/growth/${growthId}`);
    return response.data;
  },

  create: async (babyId: number, data: {
    measurementDate: string;
    weightGrams?: number;
    lengthCm?: number;
    headCircumferenceCm?: number;
    notes?: string;
  }) => {
    const response = await api.post(`/babies/${babyId}/growth`, data);
    return response.data;
  },

  update: async (babyId: number, growthId: number, data: Partial<{
    measurementDate: string;
    weightGrams: number;
    lengthCm: number;
    headCircumferenceCm: number;
    notes: string;
  }>) => {
    const response = await api.patch(`/babies/${babyId}/growth/${growthId}`, data);
    return response.data;
  },

  delete: async (babyId: number, growthId: number) => {
    const response = await api.delete(`/babies/${babyId}/growth/${growthId}`);
    return response.data;
  },

  getLatest: async (babyId: number) => {
    const response = await api.get(`/babies/${babyId}/growth/latest`);
    return response.data;
  },
};

// ====== Milestone Service ======
export const milestoneService = {
  getAll: async (babyId: number, params?: {
    category?: string;
  }) => {
    const response = await api.get(`/babies/${babyId}/milestones`, { params });
    return response.data;
  },

  get: async (babyId: number, milestoneId: number) => {
    const response = await api.get(`/babies/${babyId}/milestones/${milestoneId}`);
    return response.data;
  },

  create: async (babyId: number, data: {
    title: string;
    description?: string;
    category: string;
    achievedAt?: string;
    notes?: string;
  }) => {
    const response = await api.post(`/babies/${babyId}/milestones`, data);
    return response.data;
  },

  update: async (babyId: number, milestoneId: number, data: Partial<{
    title: string;
    description: string;
    notes: string;
    achievedAt: string;
  }>) => {
    const response = await api.patch(`/babies/${babyId}/milestones/${milestoneId}`, data);
    return response.data;
  },

  delete: async (babyId: number, milestoneId: number) => {
    const response = await api.delete(`/babies/${babyId}/milestones/${milestoneId}`);
    return response.data;
  },
};

// ====== Export Service ======
export const exportService = {
  routines: async (babyId: number, params?: {
    startDate?: string;
    endDate?: string;
    types?: string[];
  }) => {
    const response = await api.get(`/export/${babyId}/routines`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  growth: async (babyId: number) => {
    const response = await api.get(`/export/${babyId}/growth`, {
      responseType: 'blob',
    });
    return response.data;
  },

  milestones: async (babyId: number) => {
    const response = await api.get(`/export/${babyId}/milestones`, {
      responseType: 'blob',
    });
    return response.data;
  },

  fullReport: async (babyId: number) => {
    const response = await api.get(`/export/${babyId}/full`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ====== Professional Service ======
export const professionalService = {
  // Get professionals linked to a baby
  getByBaby: async (babyId: number) => {
    const response = await api.get(`/babies/${babyId}/professionals`);
    return response.data;
  },

  // Get professional details
  get: async (professionalId: number) => {
    const response = await api.get(`/professionals/${professionalId}`);
    return response.data;
  },

  // Invite a professional
  invite: async (babyId: number, data: {
    email: string;
    fullName: string;
    specialty: string;
    role: 'PEDIATRICIAN' | 'OBGYN' | 'LACTATION_CONSULTANT' | 'OTHER';
    crmNumber?: string;
    crmState?: string;
    phone?: string;
    notes?: string;
  }) => {
    const response = await api.post(`/babies/${babyId}/professionals/invite`, data);
    return response.data;
  },

  // Verify invite token (public)
  verifyToken: async (token: string) => {
    const response = await api.post('/professionals/verify-token', { token });
    return response.data;
  },

  // Activate professional account (public)
  activate: async (data: {
    token: string;
    password: string;
    phone?: string;
    city?: string;
    state?: string;
  }) => {
    const response = await api.post('/professionals/activate', data);
    return response.data;
  },

  // Resend invite
  resendInvite: async (babyId: number, professionalId: number) => {
    const response = await api.post(`/babies/${babyId}/professionals/${professionalId}/resend-invite`);
    return response.data;
  },

  // Remove professional from baby
  remove: async (babyId: number, linkId: number) => {
    const response = await api.delete(`/babies/${babyId}/professionals/${linkId}`);
    return response.data;
  },

  // Update professional link (notes, role)
  updateLink: async (babyId: number, linkId: number, data: {
    notes?: string;
    role?: 'PEDIATRICIAN' | 'OBGYN' | 'LACTATION_CONSULTANT' | 'OTHER';
  }) => {
    const response = await api.patch(`/babies/${babyId}/professionals/${linkId}`, data);
    return response.data;
  },

  // Get babies for professional (professional dashboard)
  getMyPatients: async () => {
    const response = await api.get('/professionals/my-patients');
    return response.data;
  },
};

// ====== AI Assistant Service ======
export const aiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/ai/health');
    return response.data;
  },

  // ============================================
  // Chat Sessions
  // ============================================

  // Create new chat session
  createSession: async (babyId: number, title?: string) => {
    const response = await api.post('/ai/chat/sessions', { babyId, title });
    return response.data;
  },

  // List chat sessions
  listSessions: async (babyId?: number) => {
    const response = await api.get('/ai/chat/sessions', { params: { babyId } });
    return response.data;
  },

  // Get session with messages
  getSession: async (sessionId: number) => {
    const response = await api.get(`/ai/chat/sessions/${sessionId}`);
    return response.data;
  },

  // Send message to assistant
  sendMessage: async (sessionId: number, message: string) => {
    const response = await api.post(`/ai/chat/sessions/${sessionId}/messages`, { message });
    return response.data;
  },

  // Delete session
  deleteSession: async (sessionId: number) => {
    const response = await api.delete(`/ai/chat/sessions/${sessionId}`);
    return response.data;
  },

  // Archive session
  archiveSession: async (sessionId: number) => {
    const response = await api.patch(`/ai/chat/sessions/${sessionId}/archive`);
    return response.data;
  },

  // ============================================
  // Insights
  // ============================================

  // Get insights for baby
  getInsights: async (babyId: number, options?: { refresh?: boolean; includeRead?: boolean }) => {
    const response = await api.get(`/ai/insights/${babyId}`, { params: options });
    return response.data;
  },

  // Generate new insights
  generateInsights: async (babyId: number) => {
    const response = await api.post(`/ai/insights/${babyId}/generate`);
    return response.data;
  },

  // Mark insight as read
  markInsightRead: async (insightId: number) => {
    const response = await api.patch(`/ai/insights/${insightId}/read`);
    return response.data;
  },

  // Dismiss insight
  dismissInsight: async (insightId: number) => {
    const response = await api.patch(`/ai/insights/${insightId}/dismiss`);
    return response.data;
  },

  // ============================================
  // Knowledge Base (Admin)
  // ============================================

  // List documents
  listDocuments: async () => {
    const response = await api.get('/ai/documents');
    return response.data;
  },

  // Search knowledge base
  searchKnowledge: async (query: string, topK?: number, tags?: string[]) => {
    const response = await api.post('/ai/search', { query, topK, tags });
    return response.data;
  },
};

// ====== Caregiver Service ======
export const caregiverService = {
  // Get current caregiver profile
  getMe: async () => {
    const response = await api.get('/caregivers/me');
    return response.data;
  },

  // Update current caregiver profile
  updateMe: async (data: {
    fullName?: string;
    phone?: string;
    city?: string;
    state?: string;
  }) => {
    const response = await api.put('/caregivers/me', data);
    return response.data;
  },

  // Search caregiver by email
  searchByEmail: async (email: string) => {
    const response = await api.get('/caregivers/search', { params: { email } });
    return response.data;
  },

  // Get caregiver by ID
  getById: async (id: number) => {
    const response = await api.get(`/caregivers/${id}`);
    return response.data;
  },
};

// ====== Baby Member Service ======
export const babyMemberService = {
  // List members of a baby
  listMembers: async (babyId: number) => {
    const response = await api.get(`/babies/${babyId}/members`);
    return response.data;
  },

  // Update member
  updateMember: async (babyId: number, memberId: number, data: {
    role?: string;
    permissions?: Record<string, any>;
  }) => {
    const response = await api.patch(`/babies/${babyId}/members/${memberId}`, data);
    return response.data;
  },

  // Revoke member access
  revokeMember: async (babyId: number, memberId: number) => {
    const response = await api.delete(`/babies/${babyId}/members/${memberId}`);
    return response.data;
  },
};

// ====== Settings Service ======
export const settingsService = {
  // Get all settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update notification settings
  updateNotifications: async (data: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    soundEnabled?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    routineNotifications?: {
      feeding?: boolean;
      sleep?: boolean;
      diaper?: boolean;
      bath?: boolean;
      extraction?: boolean;
    };
  }) => {
    const response = await api.put('/settings/notifications', data);
    return response.data;
  },

  // Update appearance settings
  updateAppearance: async (data: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
  }) => {
    const response = await api.put('/settings/appearance', data);
    return response.data;
  },
};

// ====== Billing Service ======
export const billingService = {
  // Get billing status
  getStatus: async () => {
    const response = await api.get('/billing/me');
    return response.data;
  },

  // Get available plans
  getPlans: async () => {
    const response = await api.get('/billing/plans');
    return response.data;
  },

  // Check if Stripe is configured
  getStripeStatus: async () => {
    const response = await api.get('/billing/status');
    return response.data;
  },

  // Create checkout session
  createCheckoutSession: async (planCode: string, interval: 'monthly' | 'yearly' = 'monthly') => {
    const response = await api.post('/billing/checkout-session', { planCode, interval });
    return response.data;
  },

  // Create portal session
  createPortalSession: async (returnUrl?: string) => {
    const response = await api.post('/billing/portal-session', { returnUrl });
    return response.data;
  },

  // Admin: Get recent subscriptions
  getAdminSubscriptions: async () => {
    const response = await api.get('/billing/admin/subscriptions');
    return response.data;
  },

  // Admin: Get billing events
  getAdminEvents: async () => {
    const response = await api.get('/billing/admin/events');
    return response.data;
  },

  // Admin: Create portal for user
  createAdminPortalSession: async (userId: number, returnUrl?: string) => {
    const response = await api.post('/billing/admin/portal-session', { userId, returnUrl });
    return response.data;
  },

  // Admin: Update plan Stripe config
  updatePlanStripeConfig: async (planId: number, data: {
    stripeProductId?: string;
    stripePriceIdMonthly?: string;
    stripePriceIdYearly?: string;
  }) => {
    const response = await api.patch(`/billing/admin/plans/${planId}`, data);
    return response.data;
  },
};

// ====== Admin AI Service ======
export const adminAiService = {
  // Config endpoints
  getConfigs: async () => {
    const response = await api.get('/admin/ai/config');
    return response.data;
  },

  getConfigById: async (id: number) => {
    const response = await api.get(`/admin/ai/config/${id}`);
    return response.data;
  },

  createConfig: async (data: {
    name: string;
    systemPrompt: string;
    guardrails?: Record<string, unknown>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }) => {
    const response = await api.post('/admin/ai/config', data);
    return response.data;
  },

  updateConfig: async (id: number, data: {
    name?: string;
    systemPrompt?: string;
    guardrails?: Record<string, unknown>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }) => {
    const response = await api.patch(`/admin/ai/config/${id}`, data);
    return response.data;
  },

  publishConfig: async (id: number) => {
    const response = await api.post(`/admin/ai/config/${id}/publish`);
    return response.data;
  },

  duplicateConfig: async (id: number) => {
    const response = await api.post(`/admin/ai/config/${id}/duplicate`);
    return response.data;
  },

  deleteConfig: async (id: number) => {
    const response = await api.delete(`/admin/ai/config/${id}`);
    return response.data;
  },

  // KB endpoints
  listDocuments: async (filters?: { status?: string; tag?: string; q?: string }) => {
    const response = await api.get('/admin/ai/kb', { params: filters });
    return response.data;
  },

  getDocumentById: async (id: number) => {
    const response = await api.get(`/admin/ai/kb/${id}`);
    return response.data;
  },

  createDocument: async (data: {
    title: string;
    sourceType: 'file' | 'url' | 'manual';
    content: string;
    tags?: string[];
  }) => {
    const response = await api.post('/admin/ai/kb', data);
    return response.data;
  },

  updateDocument: async (id: number, data: {
    title?: string;
    sourceType?: 'file' | 'url' | 'manual';
    content?: string;
    tags?: string[];
  }) => {
    const response = await api.patch(`/admin/ai/kb/${id}`, data);
    return response.data;
  },

  publishDocument: async (id: number) => {
    const response = await api.post(`/admin/ai/kb/${id}/publish`);
    return response.data;
  },

  archiveDocument: async (id: number) => {
    const response = await api.post(`/admin/ai/kb/${id}/archive`);
    return response.data;
  },

  deleteDocument: async (id: number) => {
    const response = await api.delete(`/admin/ai/kb/${id}`);
    return response.data;
  },

  getAllTags: async () => {
    const response = await api.get('/admin/ai/kb/tags');
    return response.data;
  },

  getKbStats: async () => {
    const response = await api.get('/admin/ai/kb/stats');
    return response.data;
  },

  previewPrompt: async () => {
    const response = await api.get('/admin/ai/preview');
    return response.data;
  },
};

// ====== Onboarding Service ======
export const onboardingService = {
  // Get onboarding status
  getStatus: async () => {
    const response = await api.get('/onboarding/status');
    return response.data;
  },

  // Skip onboarding
  skip: async () => {
    const response = await api.post('/onboarding/skip');
    return response.data;
  },

  // Complete onboarding
  complete: async () => {
    const response = await api.post('/onboarding/complete');
    return response.data;
  },
};

// ====== Baby Invite Service ======
export const babyInviteService = {
  // Create invite
  createInvite: async (babyId: number, data: {
    emailInvited: string;
    memberType: 'PARENT' | 'FAMILY' | 'PROFESSIONAL';
    role: string;
    invitedName?: string;
    message?: string;
    expiresInHours?: number;
  }) => {
    const response = await api.post(`/babies/${babyId}/invites`, data);
    return response.data;
  },

  // List invites
  listInvites: async (babyId: number) => {
    const response = await api.get(`/babies/${babyId}/invites`);
    return response.data;
  },

  // Verify token (public)
  verifyToken: async (token: string) => {
    const response = await api.post('/invites/verify-token', { token });
    return response.data;
  },

  // Accept invite
  acceptInvite: async (token: string) => {
    const response = await api.post('/invites/accept', { token });
    return response.data;
  },

  // Resend invite
  resendInvite: async (babyId: number, inviteId: number) => {
    const response = await api.post(`/babies/${babyId}/invites/${inviteId}/resend`);
    return response.data;
  },

  // Revoke invite
  revokeInvite: async (babyId: number, inviteId: number) => {
    const response = await api.delete(`/babies/${babyId}/invites/${inviteId}`);
    return response.data;
  },
};

// ====== Vaccine Service ======
export const vaccineService = {
  // Get available calendars
  getCalendars: async () => {
    const response = await api.get('/vaccines/calendars');
    return response.data;
  },

  // Get vaccine definitions
  getDefinitions: async (source: 'PNI' | 'SBIM' = 'PNI') => {
    const response = await api.get('/vaccines/definitions', { params: { source } });
    return response.data;
  },

  // Get vaccine summary for a baby
  getSummary: async (babyId: number) => {
    const response = await api.get(`/babies/${babyId}/vaccines/summary`);
    return response.data;
  },

  // Get vaccine timeline for a baby
  getTimeline: async (babyId: number, params?: {
    status?: 'PENDING' | 'APPLIED' | 'SKIPPED';
    source?: 'PNI' | 'SBIM';
  }) => {
    const response = await api.get(`/babies/${babyId}/vaccines/timeline`, { params });
    return response.data;
  },

  // Sync vaccines from calendar
  syncVaccines: async (babyId: number, source: 'PNI' | 'SBIM' = 'PNI') => {
    const response = await api.post(`/babies/${babyId}/vaccines/sync`, { source });
    return response.data;
  },

  // Get a specific vaccine record
  getRecord: async (babyId: number, recordId: number) => {
    const response = await api.get(`/babies/${babyId}/vaccines/record/${recordId}`);
    return response.data;
  },

  // Create a manual vaccine record
  createRecord: async (babyId: number, data: {
    vaccineKey: string;
    vaccineName: string;
    doseLabel: string;
    doseNumber?: number;
    recommendedAt: string;
    appliedAt?: string | null;
    source?: 'PNI' | 'SBIM';
    lotNumber?: string | null;
    clinicName?: string | null;
    professionalName?: string | null;
    notes?: string | null;
  }) => {
    const response = await api.post(`/babies/${babyId}/vaccines/record`, data);
    return response.data;
  },

  // Update a vaccine record
  updateRecord: async (babyId: number, recordId: number, data: {
    appliedAt?: string | null;
    status?: 'PENDING' | 'APPLIED' | 'SKIPPED';
    lotNumber?: string | null;
    clinicName?: string | null;
    professionalName?: string | null;
    notes?: string | null;
  }) => {
    const response = await api.patch(`/babies/${babyId}/vaccines/record/${recordId}`, data);
    return response.data;
  },

  // Mark vaccine as applied
  markAsApplied: async (babyId: number, recordId: number, data: {
    appliedAt: string;
    lotNumber?: string;
    clinicName?: string;
    professionalName?: string;
    notes?: string;
  }) => {
    const response = await api.post(`/babies/${babyId}/vaccines/record/${recordId}/apply`, data);
    return response.data;
  },

  // Mark vaccine as skipped
  markAsSkipped: async (babyId: number, recordId: number, notes?: string) => {
    const response = await api.post(`/babies/${babyId}/vaccines/record/${recordId}/skip`, { notes });
    return response.data;
  },

  // Reset vaccine to pending
  resetToPending: async (babyId: number, recordId: number) => {
    const response = await api.post(`/babies/${babyId}/vaccines/record/${recordId}/reset`);
    return response.data;
  },

  // Delete a vaccine record
  deleteRecord: async (babyId: number, recordId: number) => {
    const response = await api.delete(`/babies/${babyId}/vaccines/record/${recordId}`);
    return response.data;
  },
};

// ====== Notification Service ======
export const notificationService = {
  // List notifications
  list: async (params?: {
    status?: 'UNREAD' | 'READ' | 'ARCHIVED';
    type?: string;
    babyId?: number;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get<{ success: boolean; data: { count: number } }>('/notifications/count');
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId: number) => {
    const response = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Archive notification
  archive: async (notificationId: number) => {
    const response = await api.post(`/notifications/${notificationId}/archive`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  delete: async (notificationId: number) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};
