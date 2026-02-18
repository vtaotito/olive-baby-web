// Olive Baby Web - TypeScript Types

// ====== User & Auth ======
export type UserRole = 'PARENT' | 'CAREGIVER' | 'PEDIATRICIAN' | 'SPECIALIST' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  onboardingCompletedAt?: string | null;
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

// Feeding Meta
export interface FeedingMeta {
  feedingType: 'breast' | 'bottle' | 'solid';
  breastSide?: 'left' | 'right' | 'both';
  bottleMl?: number;
  bottleContent?: 'breast_milk' | 'formula' | 'mixed';
  bottleMilkType?: 'breast_milk' | 'formula' | 'mixed';
  solidDescription?: string;
  solidFoods?: string | string[];
  complement?: 'yes' | 'no';
  complementMl?: number;
  complementType?: 'formula' | 'donated_milk' | 'breast_milk' | 'other';
  complementIsMixed?: boolean;
}

// Sleep Meta
export interface SleepMeta {
  sleepQuality?: 'good' | 'regular' | 'bad';
  quality?: 'good' | 'regular' | 'bad';
  wokeUpTimes?: number;
  location?: string;
  environment?: string;
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
  waterTemperature?: number;
  products?: string[];
  productsUsed?: string[];
  hairWashed?: boolean;
}

// Milk Extraction Meta
export interface MilkExtractionMeta {
  extractionMl?: number;
  quantityMl?: number;
  extractionMethod?: 'manual' | 'electric';
  extractionType?: 'manual' | 'electric';
  breastSide?: 'left' | 'right' | 'both';
}

// Union type para meta por tipo de rotina
export type RoutineMetaUnion = FeedingMeta | SleepMeta | DiaperMeta | BathMeta | MilkExtractionMeta;

// Mapeamento de tipo para meta
export type RoutineMetaByType = {
  FEEDING: FeedingMeta;
  SLEEP: SleepMeta;
  DIAPER: DiaperMeta;
  BATH: BathMeta;
  MILK_EXTRACTION: MilkExtractionMeta;
};

// Base interface para RoutineLog
interface RoutineLogBase {
  id: number;
  babyId: number;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  notes?: string;
  createdAt: string;
}

// Discriminated union para RoutineLog com meta tipado
export interface FeedingLog extends RoutineLogBase {
  routineType: 'FEEDING';
  meta: FeedingMeta;
}

export interface SleepLog extends RoutineLogBase {
  routineType: 'SLEEP';
  meta: SleepMeta;
}

export interface DiaperLog extends RoutineLogBase {
  routineType: 'DIAPER';
  meta: DiaperMeta;
}

export interface BathLog extends RoutineLogBase {
  routineType: 'BATH';
  meta: BathMeta;
}

export interface MilkExtractionLog extends RoutineLogBase {
  routineType: 'MILK_EXTRACTION';
  meta: MilkExtractionMeta;
}

// União discriminada de todos os tipos de log
export type TypedRoutineLog = FeedingLog | SleepLog | DiaperLog | BathLog | MilkExtractionLog;

// Tipo genérico que aceita qualquer meta (retrocompatibilidade)
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

// Type guard helpers
export function isRoutineType(type: string): type is RoutineType {
  return ['FEEDING', 'SLEEP', 'DIAPER', 'BATH', 'MILK_EXTRACTION'].includes(type);
}

// Helper para obter meta tipado
export function getTypedMeta<T extends RoutineType>(
  log: RoutineLog,
  expectedType: T
): RoutineMetaByType[T] | null {
  if (log.routineType !== expectedType) return null;
  return log.meta as unknown as RoutineMetaByType[T];
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
  cpf?: string;
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

// ====== Notifications ======
export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';
export type NotificationType = 'INSIGHT' | 'ALERT' | 'REMINDER' | 'SYSTEM' | 'ACHIEVEMENT';
export type NotificationSeverity = 'info' | 'warning' | 'alert' | 'success';

export interface Notification {
  id: number;
  userId: number;
  babyId?: number;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  status: NotificationStatus;
  sourceKey?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
}
