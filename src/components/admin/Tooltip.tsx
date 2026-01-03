// Olive Baby Web - Tooltip Component (Educacional)
import { type ReactNode, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: string;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
      )}

      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
            'whitespace-nowrap max-w-xs',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            positionClasses[position]
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
}

// Info Label with Tooltip
interface InfoLabelProps {
  label: string;
  tooltip: string;
  className?: string;
}

export function InfoLabel({ label, tooltip, className }: InfoLabelProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="text-sm text-gray-500">{label}</span>
      <Tooltip content={tooltip} position="top" />
    </div>
  );
}
