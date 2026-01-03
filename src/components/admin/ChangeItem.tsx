// Olive Baby Web - Change Item Component (Mudanças Recentes)
import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ChangeType = 'increase' | 'decrease' | 'neutral' | 'info';

interface ChangeItemProps {
  icon?: ReactNode;
  type: ChangeType;
  title: string;
  description?: string;
  value?: string;
  timestamp?: string;
  onClick?: () => void;
  className?: string;
}

export function ChangeItem({
  icon,
  type,
  title,
  description,
  value,
  timestamp,
  onClick,
  className,
}: ChangeItemProps) {
  const typeConfig = {
    increase: {
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      defaultIcon: <TrendingUp className="w-4 h-4" />,
    },
    decrease: {
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-700',
      defaultIcon: <TrendingDown className="w-4 h-4" />,
    },
    neutral: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600',
      valueColor: 'text-gray-700',
      defaultIcon: <Minus className="w-4 h-4" />,
    },
    info: {
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      iconColor: 'text-sky-600',
      valueColor: 'text-sky-700',
      defaultIcon: <Clock className="w-4 h-4" />,
    },
  };

  const config = typeConfig[type];
  const displayIcon = icon || config.defaultIcon;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all',
        config.bgColor,
        config.borderColor,
        onClick && 'cursor-pointer hover:shadow-sm',
        className
      )}
    >
      <div className={cn('p-2 rounded-lg bg-white/80', config.iconColor)}>
        {displayIcon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
        {timestamp && (
          <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
        )}
      </div>
      {value && (
        <span className={cn('text-sm font-bold', config.valueColor)}>
          {value}
        </span>
      )}
    </Component>
  );
}

// Changes Section (container)
interface ChangesSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChangesSection({ title, subtitle, children, className }: ChangesSectionProps) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-2xl p-6 shadow-sm', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
