// Olive Baby Web - Milk Extraction Tracker Component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Milk, ChevronLeft, Zap, Hand } from 'lucide-react';
import { DashboardLayout } from '../layout';
import { Card, CardBody, CardHeader, Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { Timer } from './Timer';
import { useTimer } from '../../hooks/useTimer';
import { useBabyStore } from '../../stores/babyStore';
import { routineService } from '../../services/api';
import { cn } from '../../lib/utils';

type ExtractionMethod = 'manual' | 'electric';
type BreastSide = 'left' | 'right' | 'both';

const methods = [
  { value: 'manual', label: 'Manual', icon: Hand, color: 'bg-baby-pink' },
  { value: 'electric', label: 'Elétrica', icon: Zap, color: 'bg-baby-blue' },
] as const;

const breastSides = [
  { value: 'left', label: 'Esquerdo', emoji: '⬅️' },
  { value: 'right', label: 'Direito', emoji: '➡️' },
  { value: 'both', label: 'Ambos', emoji: '↔️' },
] as const;

export function ExtractionTracker() {
  const navigate = useNavigate();
  const { selectedBaby, activeRoutines, setActiveRoutine, fetchStats } = useBabyStore();
  const { success, error: showError } = useToast();
  
  const [method, setMethod] = useState<ExtractionMethod>('manual');
  const [breastSide, setBreastSide] = useState<BreastSide>('left');
  const [extractionMl, setExtractionMl] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const activeExtraction = activeRoutines.extraction;
  
  const { seconds, isRunning, start, pause, stop, setSeconds, calculateElapsed } = useTimer();

  useEffect(() => {
    if (activeExtraction) {
      const elapsed = calculateElapsed(new Date(activeExtraction.startTime));
      setSeconds(elapsed);
      start(elapsed);
      
      const meta = activeExtraction.meta as Record<string, unknown>;
      if (meta?.extractionMethod) setMethod(meta.extractionMethod as ExtractionMethod);
      if (meta?.breastSide) setBreastSide(meta.breastSide as BreastSide);
    }
  }, [activeExtraction, calculateElapsed, setSeconds, start]);

  const handleStart = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const meta: Record<string, unknown> = {
        extractionMethod: method,
        breastSide,
      };
      
      const response = await routineService.startExtraction(selectedBaby.id, meta);
      if (response.success) {
        setActiveRoutine('extraction', response.data);
        start();
        success('Extração iniciada!', 'O cronômetro está rodando');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao iniciar extração');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const meta: Record<string, unknown> = {};
      if (extractionMl) {
        meta.extractionMl = Number(extractionMl);
      }
      
      const response = await routineService.closeExtraction(selectedBaby.id, meta, notes || undefined);
      
      if (response.success) {
        setActiveRoutine('extraction', undefined);
        stop();
        const msg = extractionMl ? `${extractionMl}ml extraídos` : 'Extração finalizada';
        success('Extração registrada!', msg);
        fetchStats(selectedBaby.id);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao finalizar extração');
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
            <Milk className="w-6 h-6 text-pink-600" />
            Extração de Leite
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
              color="pink"
            />
          </CardBody>
        </Card>

        {/* Method Selection */}
        {!activeExtraction && (
          <>
            <Card>
              <CardHeader title="Método de extração" />
              <CardBody>
                <div className="grid grid-cols-2 gap-3">
                  {methods.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMethod(m.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        method === m.value
                          ? 'border-olive-500 bg-olive-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', m.color)}>
                        <m.icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Lado do peito" />
              <CardBody>
                <div className="grid grid-cols-3 gap-3">
                  {breastSides.map((side) => (
                    <button
                      key={side.value}
                      onClick={() => setBreastSide(side.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-center',
                        breastSide === side.value
                          ? 'border-olive-500 bg-olive-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span className="text-2xl mb-1 block">{side.emoji}</span>
                      <span className="text-sm font-medium">{side.label}</span>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </>
        )}

        {/* Quantity */}
        {activeExtraction && (
          <Card>
            <CardHeader title="Quantidade extraída" />
            <CardBody>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  placeholder="0"
                  value={extractionMl}
                  onChange={(e) => setExtractionMl(e.target.value)}
                  className="w-32 text-center text-2xl font-bold"
                />
                <span className="text-xl text-gray-500">ml</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Notes */}
        {activeExtraction && (
          <Card>
            <CardHeader title="Observações" />
            <CardBody>
              <textarea
                className="input min-h-[80px]"
                placeholder="Alguma observação sobre esta extração?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardBody>
          </Card>
        )}

        {/* Info */}
        {!activeExtraction && (
          <Card>
            <CardBody className="text-center py-8">
              <div className="w-16 h-16 bg-baby-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Milk className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Registrar extração de leite
              </h3>
              <p className="text-sm text-gray-500">
                Selecione o método e o lado, depois clique em "Iniciar".
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
