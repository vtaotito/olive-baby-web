import { useState } from 'react';
import { Heart, Info, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../../services/api';
import { cn } from '../../../lib/utils';
import type { Notification } from '../../../types';

interface Insight {
  id: string;
  type: 'sleep' | 'feeding' | 'diaper' | 'extraction' | 'general';
  emoji: string;
  title: string;
  message: string;
  tone: 'positive' | 'neutral' | 'attention';
}

interface InsightsCardsProps {
  insights: Insight[];
  serverInsights?: Notification[];
  isLoading?: boolean;
}

const toneStyles = {
  positive: {
    bg: 'bg-green-50/80',
    border: 'border-green-200/60',
    iconColor: 'text-green-500',
    titleColor: 'text-green-700',
    Icon: Heart,
  },
  neutral: {
    bg: 'bg-blue-50/80',
    border: 'border-blue-200/60',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-700',
    Icon: Info,
  },
  attention: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-300',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700',
    Icon: AlertTriangle,
  },
};

const severityToTone: Record<string, 'positive' | 'neutral' | 'attention'> = {
  success: 'positive',
  info: 'neutral',
  warning: 'attention',
  alert: 'attention',
};

function CompactInsightCard({ insight }: { insight: Insight }) {
  const style = toneStyles[insight.tone];
  const isAttention = insight.tone === 'attention';

  return (
    <div className={cn(
      'flex items-start gap-2.5 rounded-lg border p-3 transition-all',
      style.bg,
      style.border,
      isAttention && 'ring-1 ring-amber-300/50'
    )}>
      <span className="text-base leading-none mt-0.5 flex-shrink-0">{insight.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className={cn('font-semibold text-xs leading-tight', style.titleColor)}>
            {insight.title}
          </h4>
          {isAttention && (
            <style.Icon className={cn('w-3 h-3 animate-pulse', style.iconColor)} />
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">
          {insight.message}
        </p>
      </div>
    </div>
  );
}

function ServerInsightCard({ notification, onDismiss }: { notification: Notification; onDismiss: (id: number) => void }) {
  const tone = severityToTone[notification.severity] || 'neutral';
  const style = toneStyles[tone];

  return (
    <div className={cn(
      'flex items-start gap-2.5 rounded-lg border p-3 transition-all relative',
      style.bg,
      style.border,
    )}>
      <div className="flex-shrink-0 mt-0.5">
        <Sparkles className={cn('w-4 h-4', style.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className={cn('font-semibold text-xs leading-tight', style.titleColor)}>
            {notification.title}
          </h4>
          <span className="text-[10px] font-medium bg-olive-500 text-white px-1.5 py-0.5 rounded-full leading-none">
            Novo
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
        title="Dispensar"
      >
        <X className="w-3.5 h-3.5 text-gray-400" />
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse flex items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
      <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-20 mb-1.5"></div>
        <div className="h-2.5 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}

const VISIBLE_LIMIT = 4;

export function InsightsCards({ insights, serverInsights = [], isLoading }: InsightsCardsProps) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: (notificationId: number) => notificationService.archive(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse h-5 bg-gray-200 rounded w-36"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const hasServerInsights = serverInsights.length > 0;
  const hasClientInsights = insights.length > 0;
  if (!hasServerInsights && !hasClientInsights) return null;

  const totalCount = serverInsights.length + insights.length;
  const showToggle = totalCount > VISIBLE_LIMIT;

  let visibleServer = serverInsights;
  let visibleClient = insights;

  if (!expanded && showToggle) {
    visibleServer = serverInsights.slice(0, VISIBLE_LIMIT);
    const remainingSlots = Math.max(0, VISIBLE_LIMIT - visibleServer.length);
    visibleClient = insights.slice(0, remainingSlots);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4.5 h-4.5 text-yellow-500" />
        <h3 className="font-semibold text-sm text-gray-800">Insights do dia</h3>
        {totalCount > 0 && (
          <span className="text-[11px] text-gray-400 font-medium">
            ({totalCount})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {visibleServer.map((n) => (
          <ServerInsightCard
            key={`srv-${n.id}`}
            notification={n}
            onDismiss={(id) => archiveMutation.mutate(id)}
          />
        ))}
        {visibleClient.map((insight) => (
          <CompactInsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {showToggle && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-xs font-medium text-olive-600 hover:text-olive-700 transition-colors mx-auto"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Ver mais ({totalCount - VISIBLE_LIMIT})
            </>
          )}
        </button>
      )}
    </div>
  );
}
