// Olive Baby Web - Reason List Component (for Upgrade Candidates)
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ReasonListProps {
  reasons: string[];
  variant?: 'success' | 'warning' | 'info';
  className?: string;
}

export function ReasonList({ reasons, variant = 'info', className }: ReasonListProps) {
  const iconColors = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-olive-500',
  };

  const Icon = variant === 'warning' ? AlertCircle : CheckCircle;

  return (
    <ul className={cn('space-y-1', className)}>
      {reasons.map((reason, index) => (
        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
          <Icon className={cn('w-4 h-4 flex-shrink-0', iconColors[variant])} />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}

