// Olive Baby Web - Quick Actions FAB Component
// Botão flutuante com ações rápidas

import { useState, useEffect, useRef } from 'react';
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
    color: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
    path: '/routines/feeding',
  },
  {
    id: 'sleep',
    icon: Moon,
    label: 'Iniciar sono',
    color: 'bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700',
    path: '/routines/sleep',
  },
  {
    id: 'diaper',
    icon: Baby,
    label: 'Registrar fralda',
    color: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
    path: '/routines/diaper',
  },
  {
    id: 'bath',
    icon: Bath,
    label: 'Iniciar banho',
    color: 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700',
    path: '/routines/bath',
  },
  {
    id: 'extraction',
    icon: Droplets,
    label: 'Extração de leite',
    color: 'bg-pink-500 hover:bg-pink-600 active:bg-pink-700',
    path: '/routines/extraction',
  },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verificar se o clique foi fora do container e não no backdrop
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).classList.contains('fixed') // Não fechar se clicar no backdrop (ele já tem handler próprio)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Usar setTimeout para garantir que o evento do backdrop seja processado primeiro
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [isOpen]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

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
          className="fixed inset-0 bg-black/30 z-[45] transition-opacity duration-300"
          onClick={(e) => {
            // Fechar apenas se clicar diretamente no backdrop
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          onMouseDown={(e) => {
            // Prevenir que o backdrop capture eventos dos botões
            if (containerRef.current?.contains(e.target as Node)) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          aria-hidden="true"
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        />
      )}

      {/* FAB Container */}
      <div 
        ref={containerRef}
        className="flex flex-col-reverse items-end gap-3"
        style={{ position: 'relative', zIndex: 50 }}
        onMouseDown={(e) => {
          // Garantir que eventos dentro do container não sejam capturados pelo backdrop
          e.stopPropagation();
        }}
      >
        {/* Action Buttons */}
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction(action);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-full text-white shadow-xl transition-all duration-300',
                'transform hover:scale-105 active:scale-95',
                'cursor-pointer select-none',
                action.color,
                isOpen 
                  ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
                  : 'opacity-0 translate-y-4 pointer-events-none scale-90'
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - index - 1) * 30}ms`,
                position: 'relative',
                zIndex: 52,
              }}
              aria-label={action.label}
              type="button"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold whitespace-nowrap">{action.label}</span>
            </button>
          );
        })}

        {/* Main FAB Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
            'bg-gradient-to-br from-olive-500 to-olive-600 hover:from-olive-600 hover:to-olive-700',
            'transform hover:scale-110 active:scale-95',
            'pointer-events-auto cursor-pointer select-none',
            isOpen && 'rotate-45 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          )}
          style={{ position: 'relative', zIndex: 52 }}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu de rotinas'}
          aria-expanded={isOpen}
          type="button"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white transition-transform duration-300" />
          ) : (
            <Plus className="w-7 h-7 text-white transition-transform duration-300" />
          )}
        </button>
      </div>
    </>
  );
}
