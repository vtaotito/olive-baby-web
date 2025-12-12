// Olive Baby Web - Quick Actions FAB Component
// Botão flutuante com ações rápidas

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Utensils, Moon, Baby, Bath, Droplets } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface QuickActionsProps {
  onAction?: (action: string) => void;
}

const actions = [
  {
    id: 'feeding',
    icon: Utensils,
    label: 'Nova mamada',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    path: '/routines/feeding',
  },
  {
    id: 'sleep',
    icon: Moon,
    label: 'Iniciar sono',
    color: 'bg-indigo-500 hover:bg-indigo-600',
    path: '/routines/sleep',
  },
  {
    id: 'diaper',
    icon: Baby,
    label: 'Registrar fralda',
    color: 'bg-green-500 hover:bg-green-600',
    path: '/routines/diaper',
  },
  {
    id: 'bath',
    icon: Bath,
    label: 'Iniciar banho',
    color: 'bg-cyan-500 hover:bg-cyan-600',
    path: '/routines/bath',
  },
  {
    id: 'extraction',
    icon: Droplets,
    label: 'Extração de leite',
    color: 'bg-pink-500 hover:bg-pink-600',
    path: '/routines/extraction',
  },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action: typeof actions[0]) => {
    setIsOpen(false);
    onAction?.(action.id);
    navigate(action.path);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
        {/* Action Buttons */}
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg transition-all duration-200',
                action.color,
                isOpen 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4 pointer-events-none'
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              <Icon className="w-5 h-5" />
            </button>
          );
        })}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200',
            'bg-gradient-to-br from-olive-500 to-olive-600 hover:from-olive-600 hover:to-olive-700',
            isOpen && 'rotate-45'
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    </>
  );
}
