// Olive Baby Web - PWA Install Prompt Component
// Banner elegante que sugere ao usuário instalar o app
import { Download, X, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-safe animate-in slide-in-from-bottom duration-500">
      <div
        className={cn(
          'max-w-lg mx-auto rounded-2xl shadow-2xl border overflow-hidden',
          'bg-white dark:bg-gray-800',
          'border-olive-200 dark:border-olive-700',
        )}
      >
        {/* Header decorativo */}
        <div className="bg-gradient-to-r from-olive-500 to-olive-600 px-4 py-2">
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instale o app no seu celular</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Ícone do app */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-olive-600 flex items-center justify-center shadow-md">
                <img
                  src="/favicon.svg"
                  alt="OlieCare"
                  className="w-10 h-10"
                />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                OlieCare
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                Acesse mais rapido direto da tela inicial. Funciona mesmo offline!
              </p>
            </div>

            {/* Botão fechar */}
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Agora nao
            </button>
            <button
              onClick={onInstall}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-olive-600 hover:bg-olive-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
