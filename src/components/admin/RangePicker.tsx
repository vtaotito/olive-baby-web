// Olive Baby Web - Range Picker Component
import { cn } from '../../lib/utils';

interface RangePickerProps {
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

const defaultOptions = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
];

export function RangePicker({
  value,
  onChange,
  options = defaultOptions,
  className,
}: RangePickerProps) {
  return (
    <div className={cn('inline-flex bg-gray-100 rounded-lg p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            value === option.value
              ? 'bg-olive-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

