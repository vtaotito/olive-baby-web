// Olive Baby Web - Quick Actions Component
import { useState } from 'react';
import { 
  Baby, 
  Moon, 
  Droplets, 
  Bath,
  Milk,
  Star,
  Plus,
  Check
} from 'lucide-react';
import { useAiStore } from '../../stores/aiStore';
import { useBabyStore } from '../../stores/babyStore';
import { cn } from '../../lib/utils';

interface QuickActionsProps {
  className?: string;
}

type ActionType = 'feeding' | 'sleep' | 'diaper' | 'bath' | 'extraction' | 'milestone';

interface QuickAction {
  type: ActionType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    type: 'feeding',
    label: 'Mamada',
    icon: <Baby className="h-5 w-5" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    prompt: 'Quero registrar uma mamada para o bebê',
  },
  {
    type: 'sleep',
    label: 'Soneca',
    icon: <Moon className="h-5 w-5" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    prompt: 'Quero registrar uma soneca para o bebê',
  },
  {
    type: 'diaper',
    label: 'Fralda',
    icon: <Droplets className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    prompt: 'Quero registrar uma troca de fralda',
  },
  {
    type: 'bath',
    label: 'Banho',
    icon: <Bath className="h-5 w-5" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100',
    prompt: 'Quero registrar um banho para o bebê',
  },
  {
    type: 'extraction',
    label: 'Extração',
    icon: <Milk className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    prompt: 'Quero registrar uma extração de leite',
  },
  {
    type: 'milestone',
    label: 'Marco',
    icon: <Star className="h-5 w-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    prompt: 'Quero registrar um marco de desenvolvimento',
  },
];

export function QuickActions({ className }: QuickActionsProps) {
  const [recentAction, setRecentAction] = useState<ActionType | null>(null);
  const { selectedBaby } = useBabyStore();
  const { currentSession, createSession, sendMessage, isSending } = useAiStore();

  const handleAction = async (action: QuickAction) => {
    if (!selectedBaby || isSending) return;

    // Create session if needed
    if (!currentSession) {
      const session = await createSession(selectedBaby.id);
      if (!session) return;
    }

    // Show feedback
    setRecentAction(action.type);
    setTimeout(() => setRecentAction(null), 2000);

    // Send message to assistant
    await sendMessage(action.prompt);
  };

  if (!selectedBaby) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <Plus className="h-4 w-4 text-emerald-500" />
        Ações Rápidas
      </h3>
      <p className="text-xs text-gray-500">
        Use a Olive para registrar rotinas por conversa
      </p>
      
      <div className="grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.type}
            onClick={() => handleAction(action)}
            disabled={isSending}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-lg transition-all',
              action.bgColor,
              action.color,
              isSending && 'opacity-50 cursor-not-allowed',
              recentAction === action.type && 'ring-2 ring-emerald-500'
            )}
          >
            {recentAction === action.type ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              action.icon
            )}
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
