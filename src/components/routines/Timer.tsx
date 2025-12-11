// Olive Baby Web - Timer Component
import { cn, formatTimerDisplay } from '../../lib/utils';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '../ui';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Timer({
  seconds,
  isRunning,
  onStart,
  onPause,
  onStop,
  color = 'olive',
  size = 'lg',
}: TimerProps) {
  const sizes = {
    sm: 'w-24 h-24 text-xl',
    md: 'w-32 h-32 text-2xl',
    lg: 'w-40 h-40 text-3xl',
  };

  const colorClasses: Record<string, string> = {
    olive: 'from-olive-500 to-olive-600',
    yellow: 'from-yellow-500 to-yellow-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer Display */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          'bg-gradient-to-br shadow-lg',
          colorClasses[color] || colorClasses.olive,
          sizes[size],
          isRunning && 'timer-active'
        )}
      >
        <span className="font-mono font-bold text-white">
          {formatTimerDisplay(seconds)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRunning ? (
          <Button
            onClick={onStart}
            variant="primary"
            leftIcon={<Play className="w-5 h-5" />}
          >
            {seconds > 0 ? 'Continuar' : 'Iniciar'}
          </Button>
        ) : (
          <Button
            onClick={onPause}
            variant="secondary"
            leftIcon={<Pause className="w-5 h-5" />}
          >
            Pausar
          </Button>
        )}
        {seconds > 0 && (
          <Button
            onClick={onStop}
            variant="danger"
            leftIcon={<Square className="w-5 h-5" />}
          >
            Finalizar
          </Button>
        )}
      </div>

      {/* Status */}
      {isRunning && (
        <p className="text-sm text-gray-500 animate-pulse">
          ⏱️ Cronômetro em andamento...
        </p>
      )}
    </div>
  );
}
