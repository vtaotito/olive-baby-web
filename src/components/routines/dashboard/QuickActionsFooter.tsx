// Olive Baby Web - Quick Actions Footer Component
// Barra de ações rápidas fixa no footer

import { useNavigate } from 'react-router-dom';
import { Utensils, Moon, Baby, Bath, Droplets } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface QuickActionsFooterProps {
  onAction?: (action: string) => void;
}

const actions = [
  {
    id: 'feeding',
    icon: Utensils,
    label: 'Mamada',
    color: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
    path: '/routines/feeding',
  },
  {
    id: 'sleep',
    icon: Moon,
    label: 'Sono',
    color: 'bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700',
    path: '/routines/sleep',
  },
  {
    id: 'diaper',
    icon: Baby,
    label: 'Fralda',
    color: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
    path: '/routines/diaper',
  },
  {
    id: 'bath',
    icon: Bath,
    label: 'Banho',
    color: 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700',
    path: '/routines/bath',
  },
  {
    id: 'extraction',
    icon: Droplets,
    label: 'Extração',
    color: 'bg-pink-500 hover:bg-pink-600 active:bg-pink-700',
    path: '/routines/extraction',
  },
];

export function QuickActionsFooter({ onAction }: QuickActionsFooterProps) {
  const navigate = useNavigate();

  const handleAction = (action: typeof actions[0]) => {
    onAction?.(action.id);
    navigate(action.path);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg lg:left-72">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-2 lg:gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl',
                  'transition-all duration-200 transform hover:scale-105 active:scale-95',
                  'cursor-pointer select-none min-w-[70px]',
                  action.color,
                  'text-white shadow-md hover:shadow-lg'
                )}
                aria-label={action.label}
                type="button"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-semibold whitespace-nowrap">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

