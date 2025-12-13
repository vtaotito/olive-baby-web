// Olive Baby Web - Insight Cards Component
import { useEffect } from 'react';
import { 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Moon, 
  Baby, 
  Droplets,
  Heart,
  TrendingUp,
  Star,
  Clock,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAiStore } from '../../stores/aiStore';
import { useBabyStore } from '../../stores/babyStore';
import { cn } from '../../lib/utils';
import type { AiInsight, AiInsightSeverity, AiInsightType } from '../../types';

interface InsightCardsProps {
  className?: string;
}

export function InsightCards({ className }: InsightCardsProps) {
  const { selectedBaby } = useBabyStore();
  const { 
    insights, 
    isLoadingInsights, 
    fetchInsights, 
    markInsightRead, 
    dismissInsight 
  } = useAiStore();

  useEffect(() => {
    if (selectedBaby) {
      fetchInsights(selectedBaby.id);
    }
  }, [selectedBaby, fetchInsights]);

  const handleRefresh = () => {
    if (selectedBaby) {
      fetchInsights(selectedBaby.id, true);
    }
  };

  if (!selectedBaby) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Insights
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isLoadingInsights}
          className="text-gray-400 hover:text-emerald-500 transition-colors"
        >
          {isLoadingInsights ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      </div>

      {insights.length === 0 && !isLoadingInsights && (
        <div className="text-center py-6 text-gray-500">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum insight no momento</p>
          <p className="text-xs mt-1">Continue registrando as rotinas!</p>
        </div>
      )}

      <div className="space-y-2">
        {insights.map(insight => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onRead={() => markInsightRead(insight.id)}
            onDismiss={() => dismissInsight(insight.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface InsightCardProps {
  insight: AiInsight;
  onRead: () => void;
  onDismiss: () => void;
}

function InsightCard({ insight, onRead, onDismiss }: InsightCardProps) {
  const severityConfig = getSeverityConfig(insight.severity);
  const typeIcon = getTypeIcon(insight.type);

  const handleClick = () => {
    if (!insight.isRead) {
      onRead();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative rounded-lg p-4 border transition-all cursor-pointer',
        severityConfig.bgClass,
        severityConfig.borderClass,
        !insight.isRead && 'ring-2 ring-offset-1',
        !insight.isRead && severityConfig.ringClass
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Icon and Title */}
      <div className="flex items-start gap-3 pr-6">
        <div className={cn('p-2 rounded-full', severityConfig.iconBgClass)}>
          {typeIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-medium text-sm', severityConfig.textClass)}>
            {insight.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {insight.explanation}
          </p>
          {insight.recommendation && (
            <p className="text-xs text-gray-500 mt-2 italic">
              💡 {insight.recommendation}
            </p>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!insight.isRead && (
        <div className={cn(
          'absolute top-4 right-8 w-2 h-2 rounded-full',
          severityConfig.dotClass
        )} />
      )}
    </div>
  );
}

function getSeverityConfig(severity: AiInsightSeverity) {
  switch (severity) {
    case 'alert':
      return {
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        textClass: 'text-red-800',
        iconBgClass: 'bg-red-100',
        ringClass: 'ring-red-300',
        dotClass: 'bg-red-500',
      };
    case 'warning':
      return {
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        textClass: 'text-amber-800',
        iconBgClass: 'bg-amber-100',
        ringClass: 'ring-amber-300',
        dotClass: 'bg-amber-500',
      };
    default:
      return {
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        textClass: 'text-blue-800',
        iconBgClass: 'bg-blue-100',
        ringClass: 'ring-blue-300',
        dotClass: 'bg-blue-500',
      };
  }
}

function getTypeIcon(type: AiInsightType) {
  const iconClass = 'h-4 w-4';
  
  switch (type) {
    case 'sleep_pattern':
      return <Moon className={cn(iconClass, 'text-indigo-500')} />;
    case 'feeding_pattern':
    case 'cluster_feeding':
      return <Baby className={cn(iconClass, 'text-pink-500')} />;
    case 'diaper_alert':
      return <Droplets className={cn(iconClass, 'text-blue-500')} />;
    case 'breast_distribution':
      return <Heart className={cn(iconClass, 'text-rose-500')} />;
    case 'growth_trend':
      return <TrendingUp className={cn(iconClass, 'text-emerald-500')} />;
    case 'milestone_suggestion':
      return <Star className={cn(iconClass, 'text-amber-500')} />;
    case 'routine_anomaly':
      return <Clock className={cn(iconClass, 'text-orange-500')} />;
    default:
      return <Info className={cn(iconClass, 'text-gray-500')} />;
  }
}
