// Olive Baby Web - Status Badge Components
import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { HealthStatus } from '../../types/admin';

// Re-export for convenience
export type { HealthStatus };

interface StatusBadgeProps {
  status: HealthStatus;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, label, showIcon = true, size = 'md', className }: StatusBadgeProps) {
  const config = {
    healthy: {
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-500',
      defaultLabel: 'Saudável',
    },
    warning: {
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconColor: 'text-amber-500',
      defaultLabel: 'Atenção',
    },
    critical: {
      icon: AlertCircle,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconColor: 'text-rose-500',
      defaultLabel: 'Crítico',
    },
    neutral: {
      icon: Minus,
      color: 'bg-gray-50 text-gray-600 border-gray-200',
      iconColor: 'text-gray-400',
      defaultLabel: 'Normal',
    },
  };

  const { icon: Icon, color, iconColor, defaultLabel } = config[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        color,
        sizeClasses,
        className
      )}
    >
      {showIcon && <Icon className={cn('w-3.5 h-3.5', iconColor)} />}
      {label || defaultLabel}
    </span>
  );
}

// Trend Badge
interface TrendBadgeProps {
  value: number;
  suffix?: string;
  showIcon?: boolean;
  inverted?: boolean; // true = negative is good (e.g., churn)
  size?: 'sm' | 'md';
  className?: string;
}

export function TrendBadge({ value, suffix = 'pp', showIcon = true, inverted = false, size = 'md', className }: TrendBadgeProps) {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNeutral = value === 0;
  
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isNeutral
    ? 'text-gray-500'
    : isPositive
    ? 'text-emerald-600'
    : 'text-rose-600';

  const sizeClasses = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={cn('inline-flex items-center gap-1 font-medium', colorClass, sizeClasses, className)}>
      {showIcon && <Icon className="w-4 h-4" />}
      <span>
        {value > 0 && '+'}
        {value.toFixed(1)}{suffix}
      </span>
    </span>
  );
}

// Cohort Status Badge (combines trend + health)
interface CohortStatusProps {
  d7Retention: number;
  d7Delta?: number;
  className?: string;
}

export function CohortStatus({ d7Retention, d7Delta, className }: CohortStatusProps) {
  let status: HealthStatus = 'healthy';
  if (d7Retention < 15) status = 'critical';
  else if (d7Retention < 25) status = 'warning';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatusBadge status={status} size="sm" showIcon={false} label={`${d7Retention}%`} />
      {d7Delta !== undefined && <TrendBadge value={d7Delta} size="sm" />}
    </div>
  );
}

// Priority Badge
export type Priority = 'high' | 'medium' | 'low';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = {
    high: { color: 'bg-rose-100 text-rose-700', label: 'Alta' },
    medium: { color: 'bg-amber-100 text-amber-700', label: 'Média' },
    low: { color: 'bg-gray-100 text-gray-600', label: 'Baixa' },
  };

  const { color, label } = config[priority];

  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', color, className)}>
      {label}
    </span>
  );
}

// Alert Type Badge
export type AlertType = 'retention_drop' | 'inactive_users' | 'errors' | 'pending_invites' | 'churn_risk';

interface AlertTypeBadgeProps {
  type: AlertType;
  className?: string;
}

export function AlertTypeBadge({ type, className }: AlertTypeBadgeProps) {
  const config: Record<AlertType, { icon: typeof AlertCircle; color: string; label: string }> = {
    retention_drop: { icon: TrendingDown, color: 'bg-rose-100 text-rose-700', label: 'Retenção em queda' },
    inactive_users: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Usuários inativos' },
    errors: { icon: AlertCircle, color: 'bg-red-100 text-red-700', label: 'Erros recorrentes' },
    pending_invites: { icon: Clock, color: 'bg-sky-100 text-sky-700', label: 'Convites pendentes' },
    churn_risk: { icon: AlertCircle, color: 'bg-orange-100 text-orange-700', label: 'Risco de churn' },
  };

  const { icon: Icon, color, label } = config[type];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full', color, className)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
