// Olive Baby Web - useEntitlements Hook
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { billingService } from '../services/api';
import type { PlanFeatures, PlanLimits, PlanType } from '../types/admin';

// Default values for FREE plan (fallback)
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
  isLoading: boolean;
}

/**
 * Hook to check user entitlements (plan features and limits)
 * Fetches data from /billing/me endpoint
 * 
 * Usage:
 * ```tsx
 * const { can, isWithinLimit, isPremium, isLoading } = useEntitlements();
 * 
 * if (isLoading) return <Spinner />;
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
  const { user, isAuthenticated } = useAuthStore();

  // Fetch billing status from backend
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing', 'status'],
    queryFn: async () => {
      const response = await billingService.getStatus();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return useMemo(() => {
    const isAdmin = user?.role === 'ADMIN';
    
    // Use billing data from backend if available, otherwise fallback to defaults
    let planType: PlanType = 'FREE';
    let planName = 'Free';
    let features: PlanFeatures = { ...DEFAULT_FREE_FEATURES };
    let limits: PlanLimits = { ...DEFAULT_FREE_LIMITS };

    if (billingData) {
      // Use data from backend
      planType = billingData.planType || 'FREE';
      planName = billingData.planName || (planType === 'PREMIUM' ? 'Premium' : 'Free');
      features = billingData.features || (planType === 'PREMIUM' ? DEFAULT_PREMIUM_FEATURES : DEFAULT_FREE_FEATURES);
      limits = billingData.limits || (planType === 'PREMIUM' ? DEFAULT_PREMIUM_LIMITS : DEFAULT_FREE_LIMITS);
    } else if (isAdmin) {
      // Fallback for admin users
      planType = 'PREMIUM';
      planName = 'Premium';
      features = DEFAULT_PREMIUM_FEATURES;
      limits = DEFAULT_PREMIUM_LIMITS;
    }

    const isPremium = planType === 'PREMIUM';
    const isFree = planType === 'FREE';

    // Check if user can use a feature
    const can = (feature: FeatureKey): boolean => {
      // Admins can do everything
      if (isAdmin) return true;
      // Check if feature is enabled and subscription is active
      const featureEnabled = features[feature] === true;
      const isActive = billingData?.isActive !== false; // Default to true if not provided
      return featureEnabled && isActive;
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
      isLoading,
    };
  }, [user, billingData]);
}

// Feature display names for UI
export const FEATURE_DISPLAY_NAMES: Record<FeatureKey, string> = {
  exportPdf: 'Exportar PDF (descontinuado)',
  exportCsv: 'Exportar Dados (CSV)',
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

