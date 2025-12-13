// Olive Baby Web - Floating Actions Component
// Agrupa QuickActions e AIChatButton em um componente fixo global

import { QuickActions } from '../routines/dashboard/QuickActions';
import { AIChatButton } from '../ai/AIChatButton';

export function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3" style={{ pointerEvents: 'none' }}>
      {/* Quick Actions FAB */}
      <div style={{ pointerEvents: 'auto' }}>
        <QuickActions />
      </div>
      
      {/* AI Chat Button */}
      <div style={{ pointerEvents: 'auto' }}>
        <AIChatButton />
      </div>
    </div>
  );
}
