// Olive Baby Web - Active Routine Card Component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Utensils, Droplets, Baby, Play, Square } from 'lucide-react';
import { Card, CardBody, Button, Spinner } from '../ui';
import { routineService } from '../../services/api';
import { useToast } from '../ui/Toast';
import type { RoutineLog } from '../../types';

interface ActiveRoutineCardProps {
  routine: RoutineLog;
  type: 'feeding' | 'sleep' | 'bath' | 'extraction';
  onFinish?: () => void;
}

const routineConfig = {
  feeding: {
    icon: Utensils,
    color: 'bg-yellow-100 text-yellow-600',
    borderColor: 'border-yellow-200',
    label: 'Alimentação',
    emoji: '🍼',
  },
  sleep: {
    icon: Moon,
    color: 'bg-purple-100 text-purple-600',
    borderColor: 'border-purple-200',
    label: 'Sono',
    emoji: '😴',
  },
  bath: {
    icon: Droplets,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200',
    label: 'Banho',
    emoji: '🛁',
  },
  extraction: {
    icon: Baby,
    color: 'bg-pink-100 text-pink-600',
    borderColor: 'border-pink-200',
    label: 'Extração',
    emoji: '🤱',
  },
};

export function ActiveRoutineCard({ routine, type, onFinish }: ActiveRoutineCardProps) {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [elapsed, setElapsed] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const config = routineConfig[type];
  const Icon = config.icon;

  // Calcular tempo decorrido
  useEffect(() => {
    const startTime = new Date(routine.startTime).getTime();
    
    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [routine.startTime]);

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min ${secs}s`;
  };

  // Finalizar rotina
  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      let response;
      switch (type) {
        case 'feeding':
          response = await routineService.closeFeeding(routine.babyId, {});
          break;
        case 'sleep':
          response = await routineService.closeSleep(routine.babyId, {});
          break;
        case 'bath':
          response = await routineService.closeBath(routine.babyId, {});
          break;
        default:
          return;
      }

      if (response.success) {
        success(`${config.label} finalizada!`, `Duração: ${formatTime(elapsed)}`);
        onFinish?.();
      }
    } catch (err) {
      showError('Erro', 'Não foi possível finalizar a rotina');
    } finally {
      setIsFinishing(false);
    }
  };

  // Obter detalhes da meta
  const getMetaDetails = () => {
    const meta = routine.meta as Record<string, unknown>;
    const details: string[] = [];

    if (type === 'feeding') {
      if (meta?.feedingType === 'breast') details.push('Seio');
      if (meta?.feedingType === 'bottle') details.push('Mamadeira');
      if (meta?.feedingType === 'solid') details.push('Sólidos');
      if (meta?.breastSide === 'left') details.push('Lado esquerdo');
      if (meta?.breastSide === 'right') details.push('Lado direito');
      if (meta?.breastSide === 'both') details.push('Ambos os lados');
    }

    if (type === 'sleep') {
      if (meta?.environment) details.push(`Ambiente: ${meta.environment}`);
      if (meta?.location) details.push(`Local: ${meta.location}`);
    }

    return details.join(' | ');
  };

  return (
    <Card className={`border-2 ${config.borderColor} animate-pulse-slow`}>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.emoji}</span>
                <span className="font-semibold text-gray-800">{config.label} em andamento</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatTime(elapsed)}</div>
              {getMetaDetails() && (
                <div className="text-sm text-gray-500 mt-1">{getMetaDetails()}</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/routines/${type}`)}
            >
              <Play className="w-4 h-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleFinish}
              isLoading={isFinishing}
            >
              <Square className="w-4 h-4 mr-1" />
              Finalizar
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
