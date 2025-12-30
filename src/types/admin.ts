// Olive Baby Web - Admin Types

// ==========================================
// Plan & Subscription Types
// ==========================================

export type PlanType = 'FREE' | 'PREMIUM';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING_VERIFICATION';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIAL';

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

