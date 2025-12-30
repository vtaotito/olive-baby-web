// Olive Baby Web - Chart Card Component
import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from '../ui';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  height?: string;
}

export function ChartCard({
  title,
  subtitle,
  icon,
  children,
  className,
  isLoading,
  height = 'h-64',
}: ChartCardProps) {
  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-2xl p-6 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {icon}
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className={cn(height, 'relative')}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

