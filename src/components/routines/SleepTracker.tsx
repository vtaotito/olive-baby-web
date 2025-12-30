// Olive Baby Web - Sleep Tracker Component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, ChevronLeft, Star, CloudMoon, Sunrise } from 'lucide-react';
import { DashboardLayout } from '../layout';
import { Card, CardBody, CardHeader, Button } from '../ui';
import { useToast } from '../ui/Toast';
import { Timer } from './Timer';
import { RoutineLastRecordsTable } from './RoutineLastRecordsTable';
import { useTimer } from '../../hooks/useTimer';
import { useBabyStore } from '../../stores/babyStore';
import { routineService } from '../../services/api';
import { cn } from '../../lib/utils';

type SleepQuality = 'good' | 'regular' | 'bad';

const sleepQualities = [
  { value: 'good', label: 'Bom', emoji: '😴', color: 'bg-green-100 text-green-700' },
  { value: 'regular', label: 'Regular', emoji: '😐', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'bad', label: 'Ruim', emoji: '😫', color: 'bg-red-100 text-red-700' },
] as const;

export function SleepTracker() {
  const navigate = useNavigate();
  const { selectedBaby, activeRoutines, setActiveRoutine, fetchStats } = useBabyStore();
  const { success, error: showError } = useToast();
  
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('good');
  const [wokeUpTimes, setWokeUpTimes] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const activeSleep = activeRoutines.sleep;
  
  const { seconds, isRunning, start, pause, stop, setSeconds, calculateElapsed } = useTimer();

  useEffect(() => {
    if (activeSleep) {
      const elapsed = calculateElapsed(new Date(activeSleep.startTime));
      setSeconds(elapsed);
      start(elapsed);
    }
  }, [activeSleep, calculateElapsed, setSeconds, start]);

  const handleStart = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const response = await routineService.startSleep(selectedBaby.id);
      if (response.success) {
        setActiveRoutine('sleep', response.data);
        start();
        success('Sono iniciado!', 'O cronômetro está rodando');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao iniciar sono');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const meta: Record<string, unknown> = {
        sleepQuality,
        wokeUpTimes,
      };
      
      const response = await routineService.closeSleep(selectedBaby.id, meta, notes || undefined);
      
      if (response.success) {
        setActiveRoutine('sleep', undefined);
        stop();
        const hours = Math.floor(response.data.durationSeconds / 3600);
        const minutes = Math.floor((response.data.durationSeconds % 3600) / 60);
        success('Sono registrado!', `Duração: ${hours}h ${minutes}min`);
        fetchStats(selectedBaby.id);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao finalizar sono');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Selecione um bebê primeiro</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Moon className="w-6 h-6 text-blue-600" />
            Sono
          </h1>
          <p className="text-gray-500">{selectedBaby.name}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Timer */}
        <Card>
          <CardBody className="py-8">
            <Timer
              seconds={seconds}
              isRunning={isRunning}
              onStart={handleStart}
              onPause={pause}
              onStop={handleStop}
              color="blue"
            />
          </CardBody>
        </Card>

        {/* Sleep Quality (when finishing) */}
        {activeSleep && (
          <>
            <Card>
              <CardHeader title="Qualidade do sono" />
              <CardBody>
                <div className="grid grid-cols-3 gap-3">
                  {sleepQualities.map((quality) => (
                    <button
                      key={quality.value}
                      onClick={() => setSleepQuality(quality.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        sleepQuality === quality.value
                          ? 'border-olive-500 bg-olive-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span className="text-3xl">{quality.emoji}</span>
                      <span className="text-sm font-medium">{quality.label}</span>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Acordou quantas vezes?" />
              <CardBody>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setWokeUpTimes(Math.max(0, wokeUpTimes - 1))}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold"
                  >
                    -
                  </button>
                  <span className="text-4xl font-bold text-gray-900 w-16 text-center">
                    {wokeUpTimes}
                  </span>
                  <button
                    onClick={() => setWokeUpTimes(wokeUpTimes + 1)}
                    className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Observações" />
              <CardBody>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Alguma observação sobre este sono?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardBody>
            </Card>
          </>
        )}

        {/* Info when not started */}
        {!activeSleep && (
          <Card>
            <CardBody className="text-center py-8">
              <div className="w-16 h-16 bg-baby-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudMoon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Registrar sono de {selectedBaby.name}
              </h3>
              <p className="text-sm text-gray-500">
                Clique em "Iniciar" quando o bebê começar a dormir.
                O cronômetro será pausado automaticamente quando você finalizar.
              </p>
            </CardBody>
          </Card>
        )}

        {/* Últimos Registros */}
        <RoutineLastRecordsTable
          babyId={selectedBaby.id}
          routineType="SLEEP"
          routineTypeLabel="Sono"
        />
      </div>
    </DashboardLayout>
  );
}
