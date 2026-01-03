// Olive Baby Web - Admin Types

// ==========================================
// Plan & Subscription Types
// ==========================================

export type PlanType = 'FREE' | 'PREMIUM';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING_VERIFICATION';
export type SubscriptionStatus = 'ACTIVE' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIALING' | 'PAUSED';
export type BillingInterval = 'MONTHLY' | 'YEARLY';

export interface Plan {
  id: number;
  name: string;
  type: PlanType;
  description?: string;
  price: number;
  currency: string;
  limits: PlanLimits;
  features: PlanFeatures;
  isActive: boolean;
}

export interface PlanLimits {
  maxBabies: number;
  maxProfessionals: number;
  maxExportsPerMonth: number;
  historyDays: number;
}

export interface PlanFeatures {
  exportPdf: boolean;
  exportCsv: boolean;
  advancedInsights: boolean;
  aiChat: boolean;
  multiCaregivers: boolean;
  prioritySupport: boolean;
}

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  status: SubscriptionStatus;
  provider?: string;
  externalId?: string;
  startedAt: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  canceledAt?: string;
  endsAt?: string;
}

// ==========================================
// Admin Metrics
// ==========================================

export interface AdminMetrics {
  totalUsers: number;
  totalBabies: number;
  usersActive: number;
  routinesCount: number;
  routinesByType: Record<string, number>;
  freeUsers: number;
  premiumUsers: number;
  topUsersByRoutines: Array<{
    userId: number;
    email: string;
    fullName: string;
    routineCount: number;
  }>;
  paywallHits?: Record<string, number>;
}

// ==========================================
// Business Health Metrics (New)
// ==========================================

export interface BusinessHealthMetrics {
  activeUsers7d: number;
  activeUsers7dTrend: number;
  retentionD7: number;
  retentionD7Trend: number;
  conversionRate: number;
  conversionRateTrend: number;
  churnRisk: number;
  churnRiskTrend: number;
}

// ==========================================
// Recent Changes (New)
// ==========================================

export type ChangeType = 'retention_change' | 'paywall_hit' | 'cohort_warning' | 'milestone' | 'error_spike';

export interface RecentChange {
  id: string;
  type: ChangeType;
  title: string;
  description?: string;
  value?: string;
  impact: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  link?: string;
}

// ==========================================
// Alerts System (New)
// ==========================================

export type AlertType = 'retention_drop' | 'inactive_users' | 'errors' | 'pending_invites' | 'churn_risk' | 'cohort_warning';
export type AlertStatus = 'new' | 'seen' | 'resolved';
export type AlertPriority = 'high' | 'medium' | 'low';

export interface AdminAlert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  description: string;
  impact?: string;
  affectedCount?: number;
  createdAt: string;
  resolvedAt?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

// ==========================================
// Admin User
// ==========================================

export interface AdminUser {
  id: number;
  email: string;
  role: string;
  status: UserStatus;
  isActive: boolean;
  lastActivityAt?: string;
  createdAt: string;
  plan?: {
    name: string;
    type: PlanType;
  };
  caregiver?: {
    fullName: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  babiesCount: number;
}

export interface AdminUserDetails extends AdminUser {
  updatedAt: string;
  subscription?: Subscription;
  professional?: {
    fullName: string;
    specialty: string;
    email: string;
  };
  babies: Array<{
    id: number;
    name: string;
    birthDate: string;
    role: string;
    status: string;
  }>;
  // Extended data for profile drawer
  routinesLast7d?: number;
  routinesLast30d?: number;
  paywallHits?: number;
  churnRiskScore?: number;
}

// ==========================================
// Admin Baby
// ==========================================

export interface AdminBaby {
  id: number;
  name: string;
  birthDate: string;
  city?: string;
  state?: string;
  createdAt: string;
  primaryCaregiver?: {
    id: number;
    fullName: string;
    email: string;
    relationship: string;
  };
  caregiversCount: number;
  professionalsCount: number;
  routinesCount30d: number;
}

export interface AdminBabyDetails extends AdminBaby {
  caregivers: Array<{
    id: number;
    fullName: string;
    email: string;
    role: string;
  }>;
  professionals: Array<{
    id: number;
    fullName: string;
    specialty: string;
  }>;
  recentRoutines: Array<{
    type: string;
    count: number;
    lastAt: string;
  }>;
  insights?: string[];
}

// ==========================================
// Admin Usage Analytics
// ==========================================

export interface UsageAnalytics {
  routinesPerDay: Array<{ date: string; count: number }>;
  newUsersPerDay: Array<{ date: string; count: number }>;
  newBabiesPerDay: Array<{ date: string; count: number }>;
  conversionFunnel: {
    freeUsers: number;
    premiumUsers: number;
    conversionRate: number;
  };
  paywallHits: Record<string, number>;
}

// ==========================================
// Admin Filters
// ==========================================

export interface AdminUserFilters {
  query?: string;
  plan?: PlanType;
  role?: string;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export interface AdminBabyFilters {
  query?: string;
  state?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// Pagination
// ==========================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// Activation Funnel
// ==========================================

export interface ActivationFunnel {
  registered: number;
  createdBaby: number;
  createdFirstRoutine: number;
  created3RoutinesIn24h: number;
  used2RoutineTypesIn7d: number;
}

// ==========================================
// Health Status (Shared)
// ==========================================

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'neutral';

// ==========================================
// Cohorts (Enhanced)
// ==========================================

export type CohortHealthStatus = HealthStatus;

export interface CohortData {
  cohortStartDate: string;
  cohortEndDate: string;
  usersInCohort: number;
  d1Retention: number;
  d7Retention: number;
  d30Retention: number;
  // New fields for actionable cohorts
  d7Delta?: number;
  status?: CohortHealthStatus;
  avgRoutinesPerUser?: number;
}

export interface CohortUser {
  userId: number;
  email: string;
  fullName?: string;
  createdAt: string;
  lastActivityAt?: string;
  routinesCount: number;
  isRetained: boolean;
}

// ==========================================
// Paywall Analytics
// ==========================================

export interface PaywallAnalytics {
  hitsByFeature: Record<string, number>;
  hitsTimeline: Array<{ date: string; count: number }>;
  conversionByFeature: Record<string, {
    hits: number;
    conversions: number;
    rate: number;
  }>;
}

// ==========================================
// Upgrade Candidates
// ==========================================

export interface UpgradeCandidate {
  userId: number;
  name: string;
  email: string;
  score: number;
  reasons: string[];
  lastActivityAt: string | null;
  babiesCount: number;
  routinesCountRange: number;
  paywallHitsRange: number;
}

// ==========================================
// Data Quality
// ==========================================

export interface DataQualityReport {
  routineType: string;
  totalRoutines: number;
  withMeta: number;
  withoutMeta: number;
  metaCompleteness: number;
  missingFields: Array<{
    field: string;
    missingCount: number;
    percentage: number;
  }>;
}

// ==========================================
// Errors Analytics
// ==========================================

export interface ErrorsAnalytics {
  topRoutesByErrors: Array<{
    route: string;
    statusCode: number;
    count: number;
  }>;
  topUsersByErrors: Array<{
    userId: number;
    email: string;
    fullName?: string;
    count: number;
  }>;
  errorsByDay: Array<{
    date: string;
    count4xx: number;
    count5xx: number;
  }>;
  totalErrors: number;
  errorRate: number;
}

// ==========================================
// Dashboard Summary (New)
// ==========================================

export interface DashboardSummary {
  health: BusinessHealthMetrics;
  recentChanges: RecentChange[];
  alerts: AdminAlert[];
  quickStats: {
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    totalBabies: number;
    routinesToday: number;
    upgradeScore: number;
  };
}

// ==========================================
// Billing Types
// ==========================================

export interface BillingStatus {
  plan: PlanType;
  planName: string;
  subscription: {
    status: SubscriptionStatus;
    interval: BillingInterval;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  stripeCustomerId: string | null;
  features: PlanFeatures;
  limits: PlanLimits;
}

export interface AvailablePlan {
  id: number;
  code: string;
  name: string;
  type: PlanType;
  description: string | null;
  price: number;
  priceYearly: number | null;
  currency: string;
  features: PlanFeatures;
  limits: PlanLimits;
  hasStripeIntegration: boolean;
}

export interface BillingEvent {
  id: number;
  stripeEventId: string;
  type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface AdminSubscription {
  id: number;
  userId: number;
  planId: number;
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  interval: BillingInterval;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  user: {
    id: number;
    email: string;
    caregiver: { fullName: string } | null;
  };
  plan: {
    code: string;
    name: string;
    type: PlanType;
  };
}

// ==========================================
// AI Admin Types
// ==========================================

export type AiConfigStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type KnowledgeBaseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AiAssistantConfig {
  id: number;
  name: string;
  systemPrompt: string;
  guardrails: Record<string, unknown>;
  model: string;
  temperature: number;
  maxTokens: number;
  status: AiConfigStatus;
  version: number;
  isPublished: boolean;
  publishedAt: string | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseDocument {
  id: number;
  title: string;
  sourceType: 'file' | 'url' | 'manual';
  content: string;
  tags: string[];
  status: KnowledgeBaseStatus;
  version: number;
  publishedAt: string | null;
  archivedAt: string | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface KbStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface PromptPreview {
  config: AiAssistantConfig | { systemPrompt: string };
  knowledgeBase: {
    documentCount: number;
    content: string;
  };
  assembledPrompt: string | null;
}
