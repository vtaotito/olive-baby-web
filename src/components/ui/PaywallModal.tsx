// Olive Baby Web - Paywall Modal Component
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  Baby, 
  Users, 
  FileDown, 
  MessageSquare, 
  Sparkles 
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { FeatureKey, ResourceKey } from '../../hooks/useEntitlements';
import { FEATURE_DISPLAY_NAMES, RESOURCE_DISPLAY_NAMES } from '../../hooks/useEntitlements';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: FeatureKey;
  resource?: ResourceKey;
  currentCount?: number;
  limit?: number;
  onUpgrade?: () => void;
}

// Premium features list
const PREMIUM_FEATURES = [
  { icon: Baby, label: 'Até 5 bebês cadastrados' },
  { icon: Users, label: 'Até 10 profissionais vinculados' },
  { icon: FileDown, label: 'Exportação ilimitada (PDF/CSV)' },
  { icon: MessageSquare, label: 'Assistente IA Olive' },
  { icon: Sparkles, label: 'Insights avançados' },
  { icon: Zap, label: 'Histórico completo' },
];

export function PaywallModal({
  isOpen,
  onClose,
  feature,
  resource,
  currentCount,
  limit,
  onUpgrade,
}: PaywallModalProps) {
  // Determine the message based on feature or resource
  const getMessage = () => {
    if (feature) {
      return `O recurso "${FEATURE_DISPLAY_NAMES[feature]}" está disponível apenas no plano Premium.`;
    }
    if (resource && currentCount !== undefined && limit !== undefined) {
      return `Você atingiu o limite de ${limit} ${RESOURCE_DISPLAY_NAMES[resource].toLowerCase()} no plano Free.`;
    }
    return 'Este recurso está disponível apenas no plano Premium.';
  };

  const handleUpgrade = () => {
    // TODO: Implement actual upgrade flow
    // For now, just close the modal
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Could redirect to pricing page or open Stripe checkout
      window.open('https://oliecare.cloud/pricing', '_blank');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center">
        {/* Crown Icon */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
          <Crown className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upgrade para Premium
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {getMessage()}
        </p>

        {/* Features List */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-6 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-4">
            Recursos do Plano Premium:
          </p>
          <ul className="space-y-3">
            {PREMIUM_FEATURES.map((feat, index) => (
              <li key={index} className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <feat.icon className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-gray-700">{feat.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">A partir de</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-gray-900">R$ 29,90</span>
            <span className="text-gray-500">/mês</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            Agora não
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleUpgrade}
            leftIcon={<Crown className="w-4 h-4" />}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            Fazer Upgrade
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Hook to manage paywall modal state
import { useState, useCallback } from 'react';
import { useEntitlements } from '../../hooks/useEntitlements';

interface UsePaywallOptions {
  onBlock?: (feature?: FeatureKey, resource?: ResourceKey) => void;
}

export function usePaywall(options?: UsePaywallOptions) {
  const { can, isWithinLimit, limits } = useEntitlements();
  const [paywallState, setPaywallState] = useState<{
    isOpen: boolean;
    feature?: FeatureKey;
    resource?: ResourceKey;
    currentCount?: number;
    limit?: number;
  }>({
    isOpen: false,
  });

  /**
   * Check if user can use a feature, show paywall if not
   * Returns true if allowed, false if blocked
   */
  const checkFeature = useCallback((feature: FeatureKey): boolean => {
    if (can(feature)) {
      return true;
    }
    
    setPaywallState({
      isOpen: true,
      feature,
    });
    options?.onBlock?.(feature, undefined);
    return false;
  }, [can, options]);

  /**
   * Check if user is within a resource limit, show paywall if not
   * Returns true if allowed, false if blocked
   */
  const checkLimit = useCallback((resource: ResourceKey, currentCount: number): boolean => {
    if (isWithinLimit(resource, currentCount)) {
      return true;
    }
    
    setPaywallState({
      isOpen: true,
      resource,
      currentCount,
      limit: limits[resource],
    });
    options?.onBlock?.(undefined, resource);
    return false;
  }, [isWithinLimit, limits, options]);

  const closePaywall = useCallback(() => {
    setPaywallState({ isOpen: false });
  }, []);

  return {
    ...paywallState,
    checkFeature,
    checkLimit,
    closePaywall,
  };
}

