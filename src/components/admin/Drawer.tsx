// Olive Baby Web - Drawer Component (Slide Panel)
import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'left' | 'right';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
  position = 'right',
}: DrawerProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-full bg-white shadow-2xl flex flex-col',
          'transform transition-transform duration-300 ease-out',
          widthClasses[width],
          position === 'right' ? 'right-0' : 'left-0',
          isOpen
            ? 'translate-x-0'
            : position === 'right'
            ? 'translate-x-full'
            : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div>
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Drawer Section Component
interface DrawerSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DrawerSection({ title, children, className }: DrawerSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
