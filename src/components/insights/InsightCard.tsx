// Olive Baby Web - Insight Card Component
import { CheckCircle2, AlertTriangle, Lightbulb, Info } from 'lucide-react';
import type { Insight } from '../../utils/insights';

interface InsightCardProps {
  insight: Insight;
}

const iconMap = {
  positive: CheckCircle2,
  warning: AlertTriangle,
  tip: Lightbulb,
  neutral: Info,
};

const colorMap = {
  positive: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  tip: 'bg-blue-50 border-blue-200 text-blue-800',
  neutral: 'bg-gray-50 border-gray-200 text-gray-800',
};

export function InsightCard({ insight }: InsightCardProps) {
  const Icon = iconMap[insight.type];
  const colors = colorMap[insight.type];

  return (
    <div className={`border rounded-lg p-4 ${colors}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm leading-relaxed">{insight.message}</p>
          {insight.warnAboutMedical && (
            <p className="text-xs mt-2 opacity-75">
              ⚠️ Lembre-se: esses insights não substituem a avaliação da pediatra.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
