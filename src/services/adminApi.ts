// Olive Baby Web - Admin API Service
import api from './api';
import type {
  AdminMetrics,
  AdminUser,
  AdminUserDetails,
  AdminBaby,
  UsageAnalytics,
  AdminUserFilters,
  AdminBabyFilters,
  PaginatedResponse,
  Plan,
  PlanType,
  UserStatus,
  ActivationFunnel,
  CohortData,
  PaywallAnalytics,
  UpgradeCandidate,
  DataQualityReport,
  ErrorsAnalytics,
} from '../types/admin';

// ==========================================
// Admin Service
// ==========================================

export const adminService = {
  // ============================================
  // Metrics & Analytics
  // ============================================

  /**
   * Get admin dashboard metrics
   */
  getMetrics: async (range: '7d' | '30d' = '7d') => {
    const response = await api.get<{ success: boolean; data: AdminMetrics }>(
      '/admin/metrics',
      { params: { range } }
    );
    return response.data;
  },

  /**
   * Get usage analytics for charts
   */
  getUsageAnalytics: async (range: '7d' | '30d' | '90d' = '30d') => {
    const response = await api.get<{ success: boolean; data: UsageAnalytics }>(
      '/admin/usage',
      { params: { range } }
    );
    return response.data;
  },

  /**
   * Get available plans
   */
  getPlans: async () => {
    const response = await api.get<{ success: boolean; data: Plan[] }>('/admin/plans');
    return response.data;
  },

  // ============================================
  // User Management
  // ============================================

  /**
   * List users with filters and pagination
   */
  listUsers: async (filters: AdminUserFilters = {}) => {
    const response = await api.get<{
      success: boolean;
      data: AdminUser[];
      pagination: PaginatedResponse<AdminUser>['pagination'];
    }>('/admin/users', { params: filters });
    return response.data;
  },

  /**
   * Get user details
   */
  getUserDetails: async (userId: number) => {
    const response = await api.get<{ success: boolean; data: AdminUserDetails }>(
      `/admin/users/${userId}`
    );
    return response.data;
  },

  /**
   * Change user plan
   */
  changeUserPlan: async (userId: number, planType: PlanType) => {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/admin/users/${userId}/plan`,
      { planType }
    );
    return response.data;
  },

  /**
   * Change user status (block/unblock)
   */
  changeUserStatus: async (userId: number, status: UserStatus, reason?: string) => {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/admin/users/${userId}/status`,
      { status, reason }
    );
    return response.data;
  },

  /**
   * Change user role
   */
  changeUserRole: async (userId: number, role: 'PARENT' | 'CAREGIVER' | 'PEDIATRICIAN' | 'SPECIALIST' | 'ADMIN') => {
    const response = await api.patch<{ success: boolean; message: string; data: { oldRole: string; newRole: string } }>(
      `/admin/users/${userId}/role`,
      { role }
    );
    return response.data;
  },

  /**
   * Impersonate user (for support)
   */
  impersonateUser: async (userId: number) => {
    const response = await api.post<{
      success: boolean;
      data: {
        token: string;
        expiresIn: string;
        user: {
          id: number;
          email: string;
          role: string;
          fullName?: string;
        };
      };
    }>(`/admin/users/${userId}/impersonate`);
    return response.data;
  },

  // ============================================
  // Baby Management
  // ============================================

  /**
   * List babies with filters and pagination
   */
  listBabies: async (filters: AdminBabyFilters = {}) => {
    const response = await api.get<{
      success: boolean;
      data: AdminBaby[];
      pagination: PaginatedResponse<AdminBaby>['pagination'];
    }>('/admin/babies', { params: filters });
    return response.data;
  },

  // ============================================
  // Advanced Analytics
  // ============================================

  /**
   * Get activation funnel metrics
   */
  getActivationFunnel: async (range: '7d' | '30d' = '30d') => {
    const response = await api.get<{ success: boolean; data: ActivationFunnel }>(
      '/admin/funnel',
      { params: { range } }
    );
    return response.data;
  },

  /**
   * Get cohort retention data
   */
  getCohorts: async (lookback: number = 12) => {
    const response = await api.get<{ success: boolean; data: CohortData[] }>(
      '/admin/cohorts',
      { params: { unit: 'week', lookback } }
    );
    return response.data;
  },

  /**
   * Get paywall analytics
   */
  getPaywallAnalytics: async (range: '7d' | '30d' = '30d') => {
    const response = await api.get<{ success: boolean; data: PaywallAnalytics }>(
      '/admin/paywall',
      { params: { range } }
    );
    return response.data;
  },

  /**
   * Get upgrade candidates with lead scoring
   */
  getUpgradeCandidates: async () => {
    const response = await api.get<{ success: boolean; data: UpgradeCandidate[] }>(
      '/admin/upgrade-candidates'
    );
    return response.data;
  },

  /**
   * Get data quality report
   */
  getDataQuality: async () => {
    const response = await api.get<{ success: boolean; data: DataQualityReport[] }>(
      '/admin/data-quality'
    );
    return response.data;
  },

  /**
   * Get errors analytics
   */
  getErrorsAnalytics: async (range: '7d' | '30d' = '7d') => {
    const response = await api.get<{ success: boolean; data: ErrorsAnalytics }>(
      '/admin/errors',
      { params: { range } }
    );
    return response.data;
  },
};

export default adminService;

