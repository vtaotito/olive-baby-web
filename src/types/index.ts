// Olive Baby Web - TypeScript Types

// ====== User & Auth ======
export type UserRole = 'PARENT' | 'CAREGIVER' | 'PEDIATRICIAN' | 'SPECIALIST' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  caregiver: Caregiver | null;
}

export interface Caregiver {
  id: number;
  userId: number;
  fullName: string;
  cpf: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_INFORMED';
  city?: string;
  state?: string;
  country: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ====== Baby ======
export type Relationship = 'MOTHER' | 'FATHER' | 'GRANDMOTHER' | 'GRANDFATHER' | 'NANNY' | 'OTHER';

export interface Baby {
  id: number;
  name: string;
  birthDate: string;
  photoUrl?: string;
  city?: string;
  state?: string;
  country: string;
  birthWeightGrams?: number;
  birthLengthCm?: number;
  babyCpfHash?: string;
  createdAt: string;
  updatedAt: string;
  caregivers?: BabyCaregiver[];
}

export interface BabyCaregiver {
  id: number;
  caregiverId: number;
  babyId: number;
  relationship: Relationship;
  isPrimary: boolean;
  caregiver: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
}

// ====== Routines ======
export type RoutineType = 'FEEDING' | 'SLEEP' | 'DIAPER' | 'BATH' | 'MILK_EXTRACTION';

export interface RoutineLog {
  id: number;
  babyId: number;
  routineType: RoutineType;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  notes?: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

// Feeding Meta
export interface FeedingMeta {
  feedingType: 'breast' | 'bottle' | 'solid';
  breastSide?: 'left' | 'right' | 'both';
  bottleMl?: number;
  bottleContent?: 'breast_milk' | 'formula' | 'mixed';
  solidDescription?: string;
  complement?: 'yes' | 'no';
  complementMl?: number;
  complementType?: 'formula' | 'breast_milk' | 'other';
}

// Sleep Meta
export interface SleepMeta {
  sleepQuality?: 'good' | 'regular' | 'bad';
  wokeUpTimes?: number;
}

// Diaper Meta
export interface DiaperMeta {
  diaperType: 'pee' | 'poop' | 'both';
  consistency?: 'liquid' | 'pasty' | 'solid';
  color?: string;
}

// Bath Meta
export interface BathMeta {
  bathTemperature?: number;
  products?: string[];
}

// Milk Extraction Meta
export interface MilkExtractionMeta {
  extractionMl?: number;
  extractionMethod?: 'manual' | 'electric';
  breastSide?: 'left' | 'right' | 'both';
}

// ====== Growth ======
export interface Growth {
  id: number;
  babyId: number;
  measurementDate: string;
  weightGrams?: number;
  lengthCm?: number;
  headCircumferenceCm?: number;
  notes?: string;
  createdAt: string;
}

// ====== Milestones ======
export type MilestoneCategory = 'MOTOR' | 'COGNITIVE' | 'SOCIAL' | 'LANGUAGE' | 'HEALTH' | 'CUSTOM';

export interface Milestone {
  id: number;
  babyId: number;
  title: string;
  description?: string;
  category: MilestoneCategory;
  expectedAgeMonths?: number;
  achievedAt?: string;
  notes?: string;
  isCustom: boolean;
  createdAt: string;
}

// ====== Statistics ======
export interface BabyStats {
  feeding?: {
    count: number;
    totalMinutes: number;
    totalToday?: number;
    averageDurationMinutes?: number;
    lastFeeding?: RoutineLog;
    breastFeedings?: number;
    bottleFeedings?: number;
    totalMl?: number;
    complementMl?: number;
    breastSideDistribution?: {
      left: number;
      right: number;
      both: number;
    };
  };
  sleep?: {
    count: number;
    totalMinutes: number;
    totalHoursToday?: number;
    averageSleepHours?: number;
    lastSleep?: RoutineLog;
    sleepSessions?: number;
  };
  diaper?: {
    count: number;
    wetCount: number;
    dirtyCount: number;
    totalToday?: number;
    peeCount?: number;
    poopCount?: number;
    lastChange?: RoutineLog;
  };
  bath?: {
    count: number;
    totalToday?: number;
    lastBath?: RoutineLog;
  };
  extraction?: {
    count: number;
    totalMl: number;
    totalMlToday?: number;
    sessionsToday?: number;
    lastExtraction?: RoutineLog;
  };
  today?: {
    feedingCount: number;
    sleepMinutes: number;
    diaperCount: number;
    bathCount: number;
  };
}

// ====== API Response ======
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ====== Forms ======
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  cpf: string;
  phone?: string;
}

export interface BabyFormData {
  name: string;
  birthDate: string;
  relationship: Relationship | string;
  birthWeightGrams?: number;
  birthLengthCm?: number;
  city?: string;
  state?: string;
}

// ====== AI Assistant ======
export type AiMessageRole = 'user' | 'assistant' | 'tool' | 'system';
export type AiInsightSeverity = 'info' | 'warning' | 'alert';
export type AiInsightType = 
  | 'sleep_pattern'
  | 'feeding_pattern'
  | 'diaper_alert'
  | 'cluster_feeding'
  | 'breast_distribution'
  | 'growth_trend'
  | 'milestone_suggestion'
  | 'routine_anomaly'
  | 'general';

export interface AiChatMessage {
  id: number;
  sessionId: number;
  role: AiMessageRole;
  content: string;
  toolName?: string;
  toolPayload?: Record<string, unknown>;
  citations?: AiCitation[];
  tokensUsed?: number;
  createdAt: string;
}

export interface AiChatSession {
  id: number;
  userId: number;
  babyId: number;
  title?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: AiChatMessage[];
  baby?: {
    name: string;
    birthDate?: string;
  };
}

export interface AiCitation {
  source: string;
  title: string;
  content: string;
  similarity: number;
}

export interface AiInsight {
  id: number;
  babyId: number;
  type: AiInsightType;
  severity: AiInsightSeverity;
  title: string;
  explanation: string;
  recommendation?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  isDismissed: boolean;
  validUntil?: string;
  createdAt: string;
}

export interface AiSendMessageResponse {
  userMessage: AiChatMessage;
  assistantMessage: AiChatMessage;
  citations: AiCitation[];
  toolsUsed: string[];
}

export interface AiHealthStatus {
  openaiConfigured: boolean;
  knowledgeBase: {
    documents: number;
    chunks: number;
  };
  chatSessions: number;
}
