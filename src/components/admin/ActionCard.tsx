// Olive Baby Web - Action Card Component (Ações Recomendadas)
import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  count?: number;
  variant?: 'default' | 'warning' | 'success' | 'danger';
  onClick?: () => void;
  className?: string;
}

export function ActionCard({
  icon,
  title,
  description,
  count,
  variant = 'default',
  onClick,
  className,
}: ActionCardProps) {
  const variantClasses = {
    default: {
      bg: 'bg-white hover:bg-gray-50',
      border: 'border-gray-200 hover:border-gray-300',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
    warning: {
      bg: 'bg-amber-50/50 hover:bg-amber-50',
      border: 'border-amber-200 hover:border-amber-300',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    success: {
      bg: 'bg-emerald-50/50 hover:bg-emerald-50',
      border: 'border-emerald-200 hover:border-emerald-300',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    danger: {
      bg: 'bg-rose-50/50 hover:bg-rose-50',
      border: 'border-rose-200 hover:border-rose-300',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
    },
  };

  const styles = variantClasses[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
        'text-left group',
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className={cn('p-3 rounded-xl', styles.iconBg)}>
        <div className={styles.iconColor}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">{title}</p>
          {count !== undefined && (
            <span className={cn(
              'px-2 py-0.5 text-xs font-bold rounded-full',
              variant === 'danger' ? 'bg-rose-200 text-rose-700' :
              variant === 'warning' ? 'bg-amber-200 text-amber-700' :
              'bg-gray-200 text-gray-700'
            )}>
              {count}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </button>
  );
}

// Quick Action Button (smaller)
interface QuickActionProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'primary';
  className?: string;
}

export function QuickAction({ icon, label, onClick, variant = 'default', className }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
        variant === 'primary'
          ? 'bg-olive-600 text-white hover:bg-olive-700 shadow-sm'
          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}
