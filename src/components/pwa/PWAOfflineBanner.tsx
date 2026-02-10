// Olive Baby Web - PWA Offline Banner
// Mostra um banner discreto quando o app está offline
import { WifiOff } from 'lucide-react';

export function PWAOfflineBanner() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white text-center py-1.5 px-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-center gap-2 text-xs font-medium">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Voce esta offline. Alguns dados podem estar desatualizados.</span>
      </div>
    </div>
  );
}
