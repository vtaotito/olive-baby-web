// Olive Baby Web - KPI Card Component
import { ReactNode } from 'react';

interface KPICardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  hint?: string;
  format?: 'minutos' | 'ml' | 'percentual';
}

export function KPICard({ icon, label, value, color = 'bg-olive-100', hint, format }: KPICardProps) {
  const formatValue = (val: string | number, format?: string): string => {
    if (typeof val === 'string') return val;
    
    if (format === 'minutos') {
      return `${val} min`;
    } else if (format === 'ml') {
      return `${val} ml`;
    } else if (format === 'percentual') {
      return `${val}%`;
    }
    
    return val.toString();
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        <div className={`${color} p-2 rounded-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue(value, format)}</p>
        </div>
      </div>
      {hint && (
        <p className="text-xs text-gray-500 mt-2">{hint}</p>
      )}
    </div>
  );
}
