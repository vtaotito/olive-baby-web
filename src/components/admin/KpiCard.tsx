// Olive Baby Web - KPI Card Component
import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'olive' | 'emerald' | 'sky' | 'violet' | 'rose' | 'amber';
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'olive',
  className,
}: KpiCardProps) {
  const iconBgColors = {
    olive: 'bg-olive-100',
    emerald: 'bg-emerald-100',
    sky: 'bg-sky-100',
    violet: 'bg-violet-100',
    rose: 'bg-rose-100',
    amber: 'bg-amber-100',
  };

  const iconTextColors = {
    olive: 'text-olive-600',
    emerald: 'text-emerald-600',
    sky: 'text-sky-600',
    violet: 'text-violet-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-2xl p-6 shadow-sm',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          iconBgColors[color]
        )}>
          <div className={iconTextColors[color]}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

