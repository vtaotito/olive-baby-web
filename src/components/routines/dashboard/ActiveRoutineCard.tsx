// Olive Baby Web - Active Routine Card
// Card vivo mostrando rotina ativa com cronômetro

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Utensils, Droplets, Bath, Square, Play } from 'lucide-react';
import { Card, CardBody, Button, Spinner } from '../../ui';
import { routineService } from '../../../services/api';
import { useToast } from '../../ui/Toast';
import { cn } from '../../../lib/utils';
import type { RoutineLog } from '../../../types';

interface ActiveRoutineCardProps {
  activeRoutines: {
    feeding: RoutineLog | null;
    sleep: RoutineLog | null;
    bath: RoutineLog | null;
    extraction: RoutineLog | null;
  };
  babyId: number;
  onRoutineEnd?: () => void;
}

const routineConfig = {
  FEEDING: {
    icon: Utensils,
    label: 'Alimentação',
    verb: 'Mamando',
    color: 'bg-gradient-to-r from-yellow-400 to-orange-400',
    textColor: 'text-yellow-700',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    path: '/routines/feeding',
  },
  SLEEP: {
    icon: Moon,
    label: 'Sono',
    verb: 'Dormindo',
    color: 'bg-gradient-to-r from-indigo-400 to-purple-400',
    textColor: 'text-indigo-700',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    path: '/routines/sleep',
  },
  BATH: {
    icon: Bath,
    label: 'Banho',
    verb: 'No banho',
    color: 'bg-gradient-to-r from-cyan-400 to-blue-400',
    textColor: 'text-cyan-700',
    bgLight: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    path: '/routines/bath',
  },
  EXTRACTION: {
    icon: Droplets,
    label: 'Extração',
    verb: 'Extraindo leite',
    color: 'bg-gradient-to-r from-pink-400 to-rose-400',
    textColor: 'text-pink-700',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-200',
    path: '/routines/extraction',
  },
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function ActiveRoutineCard({ activeRoutines, babyId, onRoutineEnd }: ActiveRoutineCardProps) {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [isEnding, setIsEnding] = useState(false);
  const [elapsed, setElapsed] = useState<Record<string, number>>({});

  // Encontrar a rotina ativa
  const activeRoutine = activeRoutines.feeding || activeRoutines.sleep || activeRoutines.bath || activeRoutines.extraction;
  const routineType = activeRoutines.feeding ? 'FEEDING' 
    : activeRoutines.sleep ? 'SLEEP' 
    : activeRoutines.bath ? 'BATH' 
    : activeRoutines.extraction ? 'EXTRACTION' 
    : null;

  // Atualizar elapsed a cada segundo
  useEffect(() => {
    if (!activeRoutine) return;

    const updateElapsed = () => {
      const start = new Date(activeRoutine.startTime).getTime();
      const now = Date.now();
      const seconds = Math.floor((now - start) / 1000);
      setElapsed(prev => ({ ...prev, [activeRoutine.id]: seconds }));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeRoutine]);

  const handleEndRoutine = useCallback(async () => {
    if (!routineType || !babyId) return;

    setIsEnding(true);
    try {
      let response;
      switch (routineType) {
        case 'FEEDING':
          response = await routineService.closeFeeding(babyId, {}, undefined);
          break;
        case 'SLEEP':
          response = await routineService.closeSleep(babyId, {}, undefined);
          break;
        case 'BATH':
          response = await routineService.closeBath(babyId, {}, undefined);
          break;
        default:
          return;
      }

      if (response.success) {
        const duration = Math.round(response.data.durationSeconds / 60);
        success('Rotina finalizada!', `Duração: ${duration} minutos`);
        onRoutineEnd?.();
      }
    } catch (err) {
      showError('Erro', 'Não foi possível finalizar a rotina');
    } finally {
      setIsEnding(false);
    }
  }, [routineType, babyId, success, showError, onRoutineEnd]);

  const handleGoToRoutine = useCallback(() => {
    if (routineType) {
      navigate(routineConfig[routineType].path);
    }
  }, [routineType, navigate]);

  if (!activeRoutine || !routineType) return null;

  const config = routineConfig[routineType];
  const Icon = config.icon;
  const meta = activeRoutine.meta as Record<string, unknown>;
  const currentElapsed = elapsed[activeRoutine.id] || 0;

  // Detalhes extras baseado no tipo
  const extraDetails = [];
  if (routineType === 'FEEDING' && meta?.breastSide) {
    const sideLabels: Record<string, string> = { left: 'Esquerdo', right: 'Direito', both: 'Ambos' };
    extraDetails.push(`Lado: ${sideLabels[meta.breastSide as string] || meta.breastSide}`);
  }
  if (routineType === 'SLEEP' && meta?.environment) {
    extraDetails.push(`Ambiente: ${meta.environment}`);
  }
  if (routineType === 'SLEEP' && meta?.location) {
    extraDetails.push(`Local: ${meta.location}`);
  }

  return (
    <Card className={cn('border-2 shadow-lg animate-pulse-slow', config.borderColor, config.bgLight)}>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          {/* Info da rotina */}
          <div className="flex items-center gap-4">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-md', config.color)}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className={cn('text-lg font-bold', config.textColor)}>
                  {config.verb}
                </span>
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
              
              <p className="text-3xl font-mono font-bold text-gray-800">
                {formatDuration(currentElapsed)}
              </p>
              
              {extraDetails.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {extraDetails.join(' • ')}
                </p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndRoutine}
              disabled={isEnding}
              className="shadow-md"
            >
              {isEnding ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              Finalizar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToRoutine}
              className="text-gray-600"
            >
              <Play className="w-4 h-4 mr-1" />
              Ver detalhes
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
