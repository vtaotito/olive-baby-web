// Olive Baby Web - PWA Update Prompt Component
// Notifica o usuário quando uma nova versão está disponível
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PWAUpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function PWAUpdatePrompt({ onUpdate, onDismiss }: PWAUpdatePromptProps) {
  return (
    <div className="fixed top-4 inset-x-0 z-50 px-4 animate-in slide-in-from-top duration-500">
      <div
        className={cn(
          'max-w-md mx-auto rounded-xl shadow-2xl border overflow-hidden',
          'bg-white dark:bg-gray-800',
          'border-olive-200 dark:border-olive-700',
        )}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Ícone */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-full bg-olive-100 dark:bg-olive-900/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-olive-600 dark:text-olive-400" />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Nova versao disponivel
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Atualize para ter as melhorias mais recentes do OlieCare.
              </p>
            </div>

            {/* Botão fechar */}
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2 mt-3 ml-13">
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Depois
            </button>
            <button
              onClick={onUpdate}
              className="px-4 py-1.5 text-xs font-medium text-white bg-olive-600 hover:bg-olive-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
