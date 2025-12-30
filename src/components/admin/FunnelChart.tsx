// Olive Baby Web - Funnel Chart Component
import { cn } from '../../lib/utils';

interface FunnelStep {
  label: string;
  value: number;
  color?: string;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  className?: string;
}

export function FunnelChart({ steps, className }: FunnelChartProps) {
  const maxValue = Math.max(...steps.map(s => s.value), 1);

  return (
    <div className={cn('space-y-3', className)}>
      {steps.map((step, index) => {
        const percentage = (step.value / maxValue) * 100;
        const conversionRate = index > 0 && steps[index - 1].value > 0
          ? ((step.value / steps[index - 1].value) * 100).toFixed(1)
          : null;

        return (
          <div key={step.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{step.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{step.value}</span>
                {conversionRate && (
                  <span className="text-xs text-gray-500">
                    ({conversionRate}%)
                  </span>
                )}
              </div>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-lg transition-all duration-500',
                  step.color || 'bg-olive-500'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

