// Olive Baby Web - useEntitlements Hook
import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { PlanFeatures, PlanLimits, PlanType } from '../types/admin';

// Default values for FREE plan
const DEFAULT_FREE_LIMITS: PlanLimits = {
  maxBabies: 1,
  maxProfessionals: 0,
  maxExportsPerMonth: 0,
  historyDays: 7,
};

const DEFAULT_FREE_FEATURES: PlanFeatures = {
  exportPdf: false,
  exportCsv: false,
  advancedInsights: false,
  aiChat: false,
  multiCaregivers: false,
  prioritySupport: false,
  vaccines: false,
};

const DEFAULT_PREMIUM_LIMITS: PlanLimits = {
  maxBabies: 5,
  maxProfessionals: 10,
  maxExportsPerMonth: -1,
  historyDays: -1,
};

const DEFAULT_PREMIUM_FEATURES: PlanFeatures = {
  exportPdf: true,
  exportCsv: true,
  advancedInsights: true,
  aiChat: true,
  multiCaregivers: true,
  prioritySupport: true,
  vaccines: true,
};

export type FeatureKey = keyof PlanFeatures;
export type ResourceKey = keyof PlanLimits;

export interface EntitlementsResult {
  // Plan info
  planType: PlanType;
  planName: string;
  isPremium: boolean;
  isFree: boolean;
  
  // Feature checks
  features: PlanFeatures;
  can: (feature: FeatureKey) => boolean;
  
  // Limit checks
  limits: PlanLimits;
  isWithinLimit: (resource: ResourceKey, currentCount: number) => boolean;
  getRemainingQuota: (resource: ResourceKey, currentCount: number) => number;
  
  // Helper
  isAdmin: boolean;
}

/**
 * Hook to check user entitlements (plan features and limits)
 * 
 * Usage:
 * ```tsx
 * const { can, isWithinLimit, isPremium } = useEntitlements();
 * 
 * if (can('exportPdf')) {
 *   // Show export button
 * }
 * 
 * if (!isWithinLimit('maxBabies', currentBabiesCount)) {
 *   // Show upgrade modal
 * }
 * ```
 */
export function useEntitlements(): EntitlementsResult {
  const { user } = useAuthStore();

  return useMemo(() => {
    // Determine plan type from user (for now, we'll check based on role or default to FREE)
    // In a full implementation, this would come from the user object with plan info
    const isAdmin = user?.role === 'ADMIN';
    
    // TODO: When backend returns plan info in user object, use that instead
    // For now, assume FREE plan for all non-admin users
    const planType: PlanType = isAdmin ? 'PREMIUM' : 'FREE';
    const isPremium = planType === 'PREMIUM';
    const isFree = planType === 'FREE';
    const planName = isPremium ? 'Premium' : 'Free';

    // Get limits and features based on plan
    const limits = isPremium ? DEFAULT_PREMIUM_LIMITS : DEFAULT_FREE_LIMITS;
    const features = isPremium ? DEFAULT_PREMIUM_FEATURES : DEFAULT_FREE_FEATURES;

    // Check if user can use a feature
    const can = (feature: FeatureKey): boolean => {
      // Admins can do everything
      if (isAdmin) return true;
      return features[feature] === true;
    };

    // Check if user is within a resource limit
    const isWithinLimit = (resource: ResourceKey, currentCount: number): boolean => {
      // Admins have no limits
      if (isAdmin) return true;
      
      const limit = limits[resource];
      // -1 means unlimited
      if (limit === -1) return true;
      return currentCount < limit;
    };

    // Get remaining quota for a resource
    const getRemainingQuota = (resource: ResourceKey, currentCount: number): number => {
      // Admins have unlimited
      if (isAdmin) return -1;
      
      const limit = limits[resource];
      // -1 means unlimited
      if (limit === -1) return -1;
      return Math.max(0, limit - currentCount);
    };

    return {
      planType,
      planName,
      isPremium,
      isFree,
      features,
      can,
      limits,
      isWithinLimit,
      getRemainingQuota,
      isAdmin,
    };
  }, [user]);
}

// Feature display names for UI
export const FEATURE_DISPLAY_NAMES: Record<FeatureKey, string> = {
  exportPdf: 'Exportar PDF',
  exportCsv: 'Exportar CSV',
  advancedInsights: 'Insights Avançados',
  aiChat: 'Assistente IA',
  multiCaregivers: 'Múltiplos Cuidadores',
  prioritySupport: 'Suporte Prioritário',
  vaccines: 'Calendário de Vacinas',
};

export const RESOURCE_DISPLAY_NAMES: Record<ResourceKey, string> = {
  maxBabies: 'Número de Bebês',
  maxProfessionals: 'Profissionais Vinculados',
  maxExportsPerMonth: 'Exportações por Mês',
  historyDays: 'Dias de Histórico',
};

