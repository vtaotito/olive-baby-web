// Olive Baby Web - API Service
import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../lib/utils';
import type { AuthTokens, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = storage.get<AuthTokens>('auth_tokens');
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = storage.get<AuthTokens>('auth_tokens');
        if (tokens?.refreshToken) {
          // Try to refresh token
          const response = await axios.post<ApiResponse<AuthTokens>>(
            `${API_URL}/auth/refresh`,
            { refreshToken: tokens.refreshToken }
          );

          if (response.data.success && response.data.data) {
            // Save new tokens
            storage.set('auth_tokens', response.data.data);
            
            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        storage.remove('auth_tokens');
        storage.remove('user');
        window.location.href = '/login';
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
