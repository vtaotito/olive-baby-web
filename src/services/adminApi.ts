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
  AuditEvent,
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
   * Delete user
   */
  deleteUser: async (userId: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/users/${userId}`
    );
    return response.data;
  },

  /**
   * Get user audit trail
   */
  getUserAuditTrail: async (userId: number, limit: number = 30) => {
    const response = await api.get<{ success: boolean; data: AuditEvent[] }>(
      `/admin/users/${userId}/audit`,
      { params: { limit } }
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

  /**
   * Get baby details with full permission tree
   */
  getBabyDetails: async (babyId: number) => {
    const response = await api.get<{ success: boolean; data: any }>(`/admin/babies/${babyId}`);
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

  // ============================================
  // Communications (emails tracking / volumetria)
  // ============================================

  /**
   * List email communications (log) with filters
   */
  getCommunications: async (params?: {
    templateType?: string;
    channel?: 'B2C' | 'B2B' | 'INTERNAL';
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<{
      success: boolean;
      data: { items: EmailCommunication[]; total: number; page: number; limit: number };
    }>('/admin/communications', { params });
    return response.data;
  },

  /**
   * Volumetria de envios (por dia, template ou canal)
   */
  getCommunicationsVolume: async (params?: {
    range?: '7d' | '30d' | '90d';
    groupBy?: 'day' | 'template' | 'channel';
  }) => {
    const response = await api.get<{
      success: boolean;
      data: CommunicationsVolumeData;
    }>('/admin/communications/volume', { params });
    return response.data;
  },

  /**
   * KPI stats for communications
   */
  getCommunicationsStats: async () => {
    const response = await api.get<{
      success: boolean;
      data: CommunicationsStats;
    }>('/admin/communications/stats');
    return response.data;
  },

  /**
   * Get all email templates with rendered HTML previews
   */
  getEmailTemplates: async () => {
    const response = await api.get<{
      success: boolean;
      data: EmailTemplatePreview[];
    }>('/admin/email-templates');
    return response.data;
  },

  /**
   * Send a test email of a specific template type
   */
  sendTestEmail: async (email: string, type: string) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { email: string; type: string; sentAt: string };
    }>('/admin/test-email', { email, type });
    return response.data;
  },

  // ============================================
  // Push Notifications (Admin)
  // ============================================

  getPushStats: async () => {
    const response = await api.get<{ success: boolean; data: PushStats }>('/admin/push/stats');
    return response.data;
  },

  getPushTriggers: async () => {
    const response = await api.get<{ success: boolean; data: PushTrigger[] }>('/admin/push/triggers');
    return response.data;
  },

  sendPushBroadcast: async (data: {
    segment: string;
    title: string;
    body: string;
    clickAction?: string;
    priority?: string;
  }) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { sent: number; failed: number; noToken: number; segment: string };
    }>('/admin/push/broadcast', data);
    return response.data;
  },

  sendPushTest: async () => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { results: Array<{ success: boolean; platform: string }>; sentAt: string };
    }>('/admin/push/test');
    return response.data;
  },

  getCommunicationsHealth: async () => {
    const response = await api.get<{ success: boolean; data: CommunicationsHealth }>('/admin/communications/health');
    return response.data;
  },

  // n8n Integration
  getN8nExecutionSummary: async () => {
    const response = await api.get<{ success: boolean; data: N8nExecutionSummary }>('/admin/n8n/execution-summary');
    return response.data;
  },

  getN8nActiveJourneys: async () => {
    const response = await api.get<{ success: boolean; data: any[] }>('/admin/n8n/active-journeys');
    return response.data;
  },

  executeJourneyViaN8n: async (journeyId: number) => {
    const response = await api.post<{ success: boolean; data: any; message?: string }>('/admin/n8n/execute-journey', { journeyId });
    return response.data;
  },

  executeStepViaN8n: async (journeyId: number, stepId: number) => {
    const response = await api.post<{ success: boolean; data: any; message?: string }>('/admin/n8n/execute-step', { journeyId, stepId });
    return response.data;
  },

  triggerPushViaN8n: async (triggerId: string, segment: string, payload: { title: string; body: string; clickAction?: string }) => {
    const response = await api.post<{ success: boolean; data: any }>('/admin/n8n/trigger-push', { triggerId, segment, payload });
    return response.data;
  },

  sendEmailViaN8n: async (data: { to: string; subject: string; templateType?: string; customBody?: string; variables?: Record<string, string> }) => {
    const response = await api.post<{ success: boolean; message: string }>('/admin/n8n/send-email', data);
    return response.data;
  },

  updatePushTrigger: async (triggerId: string, data: { enabled: boolean; config?: Record<string, unknown> }) => {
    const response = await api.patch<{ success: boolean; message: string; data: PushTrigger }>(
      `/admin/push/triggers/${triggerId}`, data
    );
    return response.data;
  },

  // ============================================
  // Journeys
  // ============================================

  listJourneys: async (filters?: { category?: string; audience?: string; status?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: { items: Journey[]; total: number } }>(
      '/admin/journeys', { params: filters }
    );
    return response.data;
  },

  getJourney: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Journey }>(`/admin/journeys/${id}`);
    return response.data;
  },

  createJourney: async (data: CreateJourneyInput) => {
    const response = await api.post<{ success: boolean; data: Journey; message: string }>('/admin/journeys', data);
    return response.data;
  },

  updateJourney: async (id: number, data: Partial<CreateJourneyInput> & { status?: string }) => {
    const response = await api.patch<{ success: boolean; data: Journey; message: string }>(`/admin/journeys/${id}`, data);
    return response.data;
  },

  deleteJourney: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/journeys/${id}`);
    return response.data;
  },

  activateJourney: async (id: number, active: boolean) => {
    const response = await api.post<{ success: boolean; data: Journey; message: string }>(
      `/admin/journeys/${id}/activate`, { active }
    );
    return response.data;
  },

  replaceJourneySteps: async (journeyId: number, steps: JourneyStepInput[]) => {
    const response = await api.put<{ success: boolean; data: JourneyStep[]; message: string }>(
      `/admin/journeys/${journeyId}/steps`, { steps }
    );
    return response.data;
  },

  getJourneyMetrics: async () => {
    const response = await api.get<{ success: boolean; data: JourneyMetrics }>('/admin/journeys/metrics');
    return response.data;
  },

  getJourneyTemplates: async () => {
    const response = await api.get<{ success: boolean; data: JourneyTemplate[] }>('/admin/journeys/templates');
    return response.data;
  },

  createJourneyFromTemplate: async (templateId: string) => {
    const response = await api.post<{ success: boolean; data: Journey; message: string }>(
      '/admin/journeys/from-template', { templateId }
    );
    return response.data;
  },

  // ============================================
  // System Alerts
  // ============================================

  listAlerts: async (params?: { status?: string; severity?: string; type?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: { items: SystemAlert[]; total: number } }>(
      '/admin/alerts', { params }
    );
    return response.data;
  },

  getAlertStats: async () => {
    const response = await api.get<{ success: boolean; data: AlertStats }>('/admin/alerts/stats');
    return response.data;
  },

  updateAlertStatus: async (id: number, status: string) => {
    const response = await api.patch<{ success: boolean; data: SystemAlert; message: string }>(
      `/admin/alerts/${id}/status`, { status }
    );
    return response.data;
  },

  bulkUpdateAlerts: async (ids: number[], status: string) => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/admin/alerts/bulk-update', { ids, status }
    );
    return response.data;
  },

  resolveAlertsByType: async (type: string) => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/admin/alerts/resolve-type', { type }
    );
    return response.data;
  },

  listAlertConfigs: async () => {
    const response = await api.get<{ success: boolean; data: AlertConfig[] }>('/admin/alerts/configs');
    return response.data;
  },

  updateAlertConfig: async (id: string, data: Partial<AlertConfig>) => {
    const response = await api.patch<{ success: boolean; data: AlertConfig; message: string }>(
      `/admin/alerts/configs/${id}`, data
    );
    return response.data;
  },

  createTestAlert: async (data?: { type?: string; severity?: string; title?: string; message?: string }) => {
    const response = await api.post<{ success: boolean; data: SystemAlert; message: string }>(
      '/admin/alerts/test', data ?? {}
    );
    return response.data;
  },
};

export interface EmailCommunication {
  id: number;
  templateType: string;
  channel: string;
  recipientDomain: string | null;
  sentAt: string;
  metadata: Record<string, unknown>;
}

export type CommunicationsVolumeData =
  | { groupBy: 'day'; series: { date: string; count: number }[] }
  | { groupBy: 'template'; series: { templateType: string; count: number }[] }
  | { groupBy: 'channel'; series: { channel: string; count: number }[] };

export interface CommunicationsStats {
  total: number;
  todayCount: number;
  last30Days: number;
  avgPerDay: number;
  byChannel: Record<string, number>;
  templateRanking: Array<{ templateType: string; count: number }>;
}

export interface EmailTemplatePreview {
  type: string;
  name: string;
  channel: string;
  subject: string;
  html: string;
}

export interface PushStats {
  devices: {
    total: number;
    active: number;
    byPlatform: Record<string, number>;
  };
  capabilities: {
    webPush: boolean;
    fcm: boolean;
    expo: boolean;
  };
  pushSends: {
    total: number;
    today: number;
    last30Days: number;
    byChannel: Record<string, number>;
  };
}

export interface PushTrigger {
  id: string;
  name: string;
  description: string;
  channel: 'B2C' | 'B2B' | 'INTERNAL';
  category: 'engagement' | 'lifecycle' | 'clinical' | 'system';
  enabled: boolean;
  savedConfig?: Record<string, unknown>;
  defaultPayload: {
    title: string;
    body: string;
    clickAction?: string;
    priority?: string;
  };
  configSchema: Array<{
    key: string;
    label: string;
    type: string;
    default: number | boolean | string;
  }>;
}

// ==========================================
// Journey Types
// ==========================================

export type JourneyCategory = 'engagement' | 'onboarding' | 'premium' | 'invites' | 'retention';
export type JourneyAudience = 'all' | 'b2c' | 'b2b' | 'premium' | 'free';
export type JourneyStatusType = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type StepType = 'email' | 'push' | 'delay' | 'condition';

export interface JourneyStep {
  id: number;
  journeyId: number;
  stepOrder: number;
  type: StepType;
  name: string;
  config: Record<string, unknown>;
  variables?: Record<string, unknown>[];
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  createdAt: string;
}

export interface Journey {
  id: number;
  name: string;
  description?: string;
  category: JourneyCategory;
  audience: JourneyAudience;
  status: JourneyStatusType;
  priority: number;
  tags: string[];
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalConverted: number;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  steps: JourneyStep[];
}

export interface CreateJourneyInput {
  name: string;
  description?: string;
  category: JourneyCategory;
  audience: JourneyAudience;
  priority?: number;
  tags?: string[];
  steps?: JourneyStepInput[];
}

export interface JourneyStepInput {
  type: StepType;
  name: string;
  stepOrder: number;
  config: Record<string, unknown>;
  variables?: Record<string, unknown>[];
}

export interface JourneyMetrics {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  totalSent: number;
  totalDelivered: number;
  recentActive: Journey[];
}

export interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  audience: string;
  steps: JourneyStepInput[];
}

// ==========================================
// Alert Types
// ==========================================

export type AlertSeverityType = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type AlertStatusType = 'NEW' | 'SEEN' | 'RESOLVED' | 'MUTED';

export interface SystemAlert {
  id: number;
  type: string;
  severity: AlertSeverityType;
  status: AlertStatusType;
  title: string;
  message: string;
  component: string;
  metadata?: Record<string, unknown>;
  resolvedAt?: string;
  resolvedBy?: string;
  notified: boolean;
  createdAt: string;
}

export interface AlertConfig {
  id: string;
  name: string;
  description?: string;
  category: string;
  enabled: boolean;
  threshold?: Record<string, unknown>;
  channels: string[];
  cooldownMin: number;
  recipients?: string[];
  updatedAt: string;
}

export interface AlertStats {
  total: number;
  todayCount: number;
  last24hCount: number;
  last7dCount: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  typeRanking: Array<{ type: string; count: number }>;
  unresolvedCritical: number;
  recentCritical: SystemAlert[];
}

export interface CommunicationsHealth {
  email: {
    status: 'operational' | 'degraded' | 'down';
    provider: string;
    fromEmail: string;
    alertEmail: string;
    sentToday: number;
    sentLast7d: number;
    hasMailerSend: boolean;
    hasSmtp: boolean;
  };
  push: {
    status: 'operational' | 'down';
    vapid: boolean;
    fcm: boolean;
    activeDevices: number;
    sentToday: number;
    sentLast7d: number;
  };
  alerts: {
    unresolvedCommsAlerts: number;
  };
  updatedAt: string;
}

export interface N8nExecutionSummary {
  activeJourneys: number;
  steps: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
  };
  communications: {
    emailsToday: number;
    pushToday: number;
    emailsWeek: number;
    pushWeek: number;
  };
}

export default adminService;

