// Olive Baby Web - Milk Extraction Tracker Component
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Milk, ChevronLeft, Zap, Hand, Clock, Play, Pause } from 'lucide-react';
import { DashboardLayout } from '../layout';
import { Card, CardBody, CardHeader, Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { Timer } from './Timer';
import { RoutineRecordsPanel } from './RoutineRecordsPanel';
import { useTimer } from '../../hooks/useTimer';
import { useBabyStore } from '../../stores/babyStore';
import { routineService } from '../../services/api';
import { cn, formatTimerDisplay } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [isCheckingOpen, setIsCheckingOpen] = useState(true);
  const hasCheckedRef = useRef(false);
  const timerInitializedRef = useRef(false);
  
  const activeExtraction = activeRoutines.extraction;
  
  const { seconds, isRunning, start, pause, stop, setSeconds, calculateElapsed } = useTimer();

  // Resetar refs quando o babyId mudar
  useEffect(() => {
    hasCheckedRef.current = false;
    timerInitializedRef.current = false;
  }, [selectedBaby?.id]);

  // Verificar se há rotina aberta ao carregar (apenas uma vez por babyId)
  useEffect(() => {
    if (!selectedBaby || hasCheckedRef.current) {
      if (!selectedBaby) setIsCheckingOpen(false);
      return;
    }
    
    hasCheckedRef.current = true;
    setIsCheckingOpen(true);
    
    const checkOpenRoutine = async () => {
      try {
        console.log('[ExtractionTracker] Verificando rotina aberta para baby:', selectedBaby.id);
        const response = await routineService.getOpenExtraction(selectedBaby.id);
        console.log('[ExtractionTracker] Resposta:', response);
        
        if (response.success && response.data) {
          console.log('[ExtractionTracker] Rotina aberta encontrada:', response.data);
          // Há uma rotina aberta - configurar estado
          setActiveRoutine('extraction', response.data);
          
          // Restaurar tipo e configurações
          const meta = response.data.meta as Record<string, unknown>;
          if (meta?.extractionMethod) setMethod(meta.extractionMethod as ExtractionMethod);
          if (meta?.breastSide) setBreastSide(meta.breastSide as BreastSide);
          
          // Iniciar timer com tempo decorrido
          const elapsed = calculateElapsed(new Date(response.data.startTime));
          console.log('[ExtractionTracker] Tempo decorrido:', elapsed, 'segundos');
          setSeconds(elapsed);
          timerInitializedRef.current = true;
          // Não iniciar automaticamente - usuário decide se quer continuar
        } else {
          console.log('[ExtractionTracker] Nenhuma rotina aberta');
        }
      } catch (err) {
        // Sem rotina aberta - tudo ok
        console.log('[ExtractionTracker] Erro ou sem rotina:', err);
      } finally {
        setIsCheckingOpen(false);
      }
    };
    
    checkOpenRoutine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBaby?.id]); // Apenas quando o babyId mudar

  const handleStart = async () => {
    if (!selectedBaby) return;
    
    // Se já há rotina ativa, apenas retomar o timer
    if (activeExtraction) {
      const elapsed = calculateElapsed(new Date(activeExtraction.startTime));
      setSeconds(elapsed);
      start(elapsed);
      success('Extração retomada!', 'O cronômetro está rodando novamente');
      return;
    }
    
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

  const handlePause = () => {
    pause();
    success('Extração pausada', 'Você pode retomar a qualquer momento');
  };

  const handleStop = async () => {
    if (!selectedBaby || !activeExtraction) return;
    
    if (!extractionMl || Number(extractionMl) <= 0) {
      showError('Atenção', 'Por favor, informe a quantidade de leite extraído antes de finalizar');
      return;
    }
    
    setIsLoading(true);
    try {
      // Preservar dados originais do meta e adicionar quantidade extraída
      const existingMeta = (activeExtraction.meta as Record<string, unknown>) || {};
      const meta: Record<string, unknown> = {
        ...existingMeta,
        extractionMl: Number(extractionMl),
      };
      
      const response = await routineService.closeExtraction(selectedBaby.id, meta, notes || undefined);
      
      if (response.success) {
        setActiveRoutine('extraction', undefined);
        stop();
        const msg = `${extractionMl}ml extraídos`;
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

  if (isCheckingOpen) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
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
        {/* Active Extraction Info */}
        {activeExtraction && (
          <Card className="border-2 border-pink-200 bg-pink-50/50">
            <CardBody className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <Milk className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Extração em andamento</p>
                    <p className="text-sm text-gray-600">
                      Iniciada às {format(new Date(activeExtraction.startTime), "HH:mm", { locale: ptBR })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {methods.find(m => m.value === method)?.label} • {breastSides.find(s => s.value === breastSide)?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-pink-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-mono font-semibold">
                      {formatTimerDisplay(seconds)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Timer */}
        <Card>
          <CardBody className="py-8">
            <Timer
              seconds={seconds}
              isRunning={isRunning}
              onStart={handleStart}
              onPause={handlePause}
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

        {/* Quantity - Always visible when active */}
        {activeExtraction && (
          <Card className={cn(
            !extractionMl || Number(extractionMl) <= 0 ? 'border-2 border-amber-300 bg-amber-50/50' : ''
          )}>
            <CardHeader title="Quantidade extraída" />
            <CardBody>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  placeholder="0"
                  value={extractionMl}
                  onChange={(e) => setExtractionMl(e.target.value)}
                  className="w-32 text-center text-2xl font-bold"
                  min="0"
                  step="1"
                />
                <span className="text-xl text-gray-500">ml</span>
              </div>
              {(!extractionMl || Number(extractionMl) <= 0) && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                  ⚠️ Informe a quantidade antes de finalizar
                </p>
              )}
            </CardBody>
          </Card>
        )}

        {/* Notes */}
        {activeExtraction && (
          <Card>
            <CardHeader title="Observações (opcional)" />
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

        {/* Registros Salvos */}
        <RoutineRecordsPanel
          babyId={selectedBaby.id}
          routineType="MILK_EXTRACTION"
          routineTypeLabel="Extração de Leite"
          limit={10}
        />
      </div>
    </DashboardLayout>
  );
}
