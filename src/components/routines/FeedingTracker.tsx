// Olive Baby Web - Feeding Tracker Component
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Baby as BabyIcon, Milk, Cookie, ChevronLeft, AlertCircle, Play, Square, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../layout';
import { Card, CardBody, CardHeader, Button, Input, Modal, Spinner } from '../ui';
import { useToast } from '../ui/Toast';
import { Timer } from './Timer';
import { RoutineLastRecordsTable } from './RoutineLastRecordsTable';
import { useTimer } from '../../hooks/useTimer';
import { useBabyStore } from '../../stores/babyStore';
import { routineService } from '../../services/api';
import { cn } from '../../lib/utils';

type FeedingType = 'breast' | 'bottle' | 'solid';
type BreastSide = 'left' | 'right' | 'both';

const feedingTypes = [
  { value: 'breast', label: 'Amamentação', icon: BabyIcon, color: 'bg-baby-pink' },
  { value: 'bottle', label: 'Mamadeira', icon: Milk, color: 'bg-baby-blue' },
  { value: 'solid', label: 'Sólidos', icon: Cookie, color: 'bg-baby-yellow' },
] as const;

const breastSides = [
  { value: 'left', label: 'Esquerdo', emoji: '⬅️' },
  { value: 'right', label: 'Direito', emoji: '➡️' },
  { value: 'both', label: 'Ambos', emoji: '↔️' },
] as const;

export function FeedingTracker() {
  const navigate = useNavigate();
  const { selectedBaby, activeRoutines, setActiveRoutine, fetchStats } = useBabyStore();
  const { success, error: showError } = useToast();
  
  const [feedingType, setFeedingType] = useState<FeedingType>('breast');
  const [breastSide, setBreastSide] = useState<BreastSide>('left');
  const [bottleMl, setBottleMl] = useState('');
  const [bottleContent, setBottleContent] = useState<'breast_milk' | 'formula' | 'mixed'>('breast_milk');
  const [solidDescription, setSolidDescription] = useState('');
  const [complement, setComplement] = useState(false);
  const [complementMl, setComplementMl] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOpen, setIsCheckingOpen] = useState(true);
  
  // Modal para rotina já aberta
  const [showOpenRoutineModal, setShowOpenRoutineModal] = useState(false);
  const [openRoutineData, setOpenRoutineData] = useState<any>(null);
  
  const activeFeeding = activeRoutines.feeding;
  
  const { seconds, isRunning, start, pause, stop, setSeconds, calculateElapsed } = useTimer();

  // Verificar se há rotina aberta ao carregar
  const checkOpenRoutine = useCallback(async () => {
    if (!selectedBaby) {
      setIsCheckingOpen(false);
      return;
    }
    
    setIsCheckingOpen(true);
    try {
      console.log('[FeedingTracker] Verificando rotina aberta para baby:', selectedBaby.id);
      const response = await routineService.getOpenFeeding(selectedBaby.id);
      console.log('[FeedingTracker] Resposta:', response);
      
      if (response.success && response.data) {
        console.log('[FeedingTracker] Rotina aberta encontrada:', response.data);
        // Há uma rotina aberta - configurar estado
        setOpenRoutineData(response.data);
        setActiveRoutine('feeding', response.data);
        
        // Restaurar tipo e configurações
        const meta = response.data.meta as Record<string, unknown>;
        if (meta?.feedingType) setFeedingType(meta.feedingType as FeedingType);
        if (meta?.breastSide) setBreastSide(meta.breastSide as BreastSide);
        
        // Iniciar timer com tempo decorrido
        const elapsed = calculateElapsed(new Date(response.data.startTime));
        console.log('[FeedingTracker] Tempo decorrido:', elapsed, 'segundos');
        setSeconds(elapsed);
        start(elapsed);
      } else {
        console.log('[FeedingTracker] Nenhuma rotina aberta');
      }
    } catch (err) {
      // Sem rotina aberta - tudo ok
      console.log('[FeedingTracker] Erro ou sem rotina:', err);
    } finally {
      setIsCheckingOpen(false);
    }
  }, [selectedBaby, setActiveRoutine, calculateElapsed, setSeconds, start]);

  useEffect(() => {
    checkOpenRoutine();
  }, [checkOpenRoutine]);

  // Resume timer if there's an active feeding (apenas se não estiver verificando)
  useEffect(() => {
    if (activeFeeding && !isCheckingOpen && !isRunning) {
      console.log('[FeedingTracker] Retomando timer para rotina ativa');
      const elapsed = calculateElapsed(new Date(activeFeeding.startTime));
      setSeconds(elapsed);
      start(elapsed);
      
      // Restore meta
      const meta = activeFeeding.meta as Record<string, unknown>;
      if (meta?.feedingType) setFeedingType(meta.feedingType as FeedingType);
      if (meta?.breastSide) setBreastSide(meta.breastSide as BreastSide);
    }
  }, [activeFeeding, calculateElapsed, setSeconds, start, isCheckingOpen, isRunning]);

  const handleStart = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const meta: Record<string, unknown> = { feedingType };
      if (feedingType === 'breast') {
        meta.breastSide = breastSide;
      } else if (feedingType === 'bottle') {
        meta.bottleContent = bottleContent;
      }
      
      const response = await routineService.startFeeding(selectedBaby.id, meta);
      if (response.success) {
        setActiveRoutine('feeding', response.data);
        start();
        success('Alimentação iniciada!', 'O cronômetro está rodando');
      }
    } catch (err: unknown) {
      const error = err as { 
        response?: { 
          data?: { 
            message?: string;
            code?: string;
            data?: { openRoutine?: any };
          } 
        }; 
        message?: string 
      };
      
      // Verificar se é erro de rotina já aberta (409)
      if (error.response?.data?.code === 'FEEDING_ALREADY_OPEN' && error.response?.data?.data?.openRoutine) {
        setOpenRoutineData(error.response.data.data.openRoutine);
        setShowOpenRoutineModal(true);
      } else {
        showError('Erro', error.response?.data?.message || 'Falha ao iniciar alimentação');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para retomar rotina existente
  const handleResumeRoutine = () => {
    if (openRoutineData) {
      setActiveRoutine('feeding', openRoutineData);
      const elapsed = calculateElapsed(new Date(openRoutineData.startTime));
      setSeconds(elapsed);
      start(elapsed);
      
      // Restaurar configurações
      const meta = openRoutineData.meta as Record<string, unknown>;
      if (meta?.feedingType) setFeedingType(meta.feedingType as FeedingType);
      if (meta?.breastSide) setBreastSide(meta.breastSide as BreastSide);
      
      setShowOpenRoutineModal(false);
      success('Alimentação retomada!', 'Continue de onde parou');
    }
  };

  // Handler para finalizar rotina existente rapidamente
  const handleQuickFinish = async () => {
    if (!selectedBaby || !openRoutineData) return;
    
    setIsLoading(true);
    try {
      const response = await routineService.closeFeeding(selectedBaby.id, {}, undefined);
      if (response.success) {
        setActiveRoutine('feeding', undefined);
        stop();
        setShowOpenRoutineModal(false);
        setOpenRoutineData(null);
        success('Alimentação finalizada!', `Duração: ${Math.round(response.data.durationSeconds / 60)} minutos`);
        fetchStats(selectedBaby.id);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao finalizar alimentação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const meta: Record<string, unknown> = {};
      
      if (feedingType === 'bottle' && bottleMl) {
        meta.bottleMl = Number(bottleMl);
      }
      if (feedingType === 'solid' && solidDescription) {
        meta.solidDescription = solidDescription;
      }
      if (complement) {
        meta.complement = 'yes';
        if (complementMl) meta.complementMl = Number(complementMl);
      }
      
      const response = await routineService.closeFeeding(selectedBaby.id, meta, notes || undefined);
      
      if (response.success) {
        setActiveRoutine('feeding', undefined);
        stop();
        success('Alimentação registrada!', `Duração: ${Math.round(response.data.durationSeconds / 60)} minutos`);
        fetchStats(selectedBaby.id);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao finalizar alimentação');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular tempo decorrido para exibição no modal
  const getElapsedTime = () => {
    if (!openRoutineData?.startTime) return '00:00:00';
    const elapsed = Math.floor((Date.now() - new Date(openRoutineData.startTime).getTime()) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  // Mostrar spinner enquanto verifica rotina aberta
  if (isCheckingOpen) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
          <p className="text-gray-500 mt-4">Verificando alimentação em andamento...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Modal para rotina já aberta */}
      <Modal 
        isOpen={showOpenRoutineModal} 
        onClose={() => setShowOpenRoutineModal(false)}
        title="Alimentação em andamento"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          
          <p className="text-gray-700 mb-2">
            Já existe uma alimentação em andamento desde:
          </p>
          
          <p className="text-3xl font-bold text-yellow-600 mb-4">
            {getElapsedTime()}
          </p>
          
          {openRoutineData?.meta?.feedingType && (
            <p className="text-sm text-gray-500 mb-6">
              Tipo: {
                openRoutineData.meta.feedingType === 'breast' ? 'Amamentação' :
                openRoutineData.meta.feedingType === 'bottle' ? 'Mamadeira' : 'Sólidos'
              }
              {openRoutineData.meta.breastSide && (
                <> • Lado: {
                  openRoutineData.meta.breastSide === 'left' ? 'Esquerdo' :
                  openRoutineData.meta.breastSide === 'right' ? 'Direito' : 'Ambos'
                }</>
              )}
            </p>
          )}
          
          <div className="flex flex-col gap-3">
            <Button onClick={handleResumeRoutine} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Retomar alimentação
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleQuickFinish} 
              className="w-full"
              isLoading={isLoading}
            >
              <Square className="w-4 h-4 mr-2" />
              Finalizar agora
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setShowOpenRoutineModal(false)} 
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-yellow-600" />
            Alimentação
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
              color="yellow"
            />
          </CardBody>
        </Card>

        {/* Feeding Type Selection */}
        {!activeFeeding && (
          <Card>
            <CardHeader title="Tipo de alimentação" />
            <CardBody>
              <div className="grid grid-cols-3 gap-3">
                {feedingTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFeedingType(type.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      feedingType === type.value
                        ? 'border-olive-500 bg-olive-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', type.color)}>
                      <type.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Breast Side Selection */}
        {feedingType === 'breast' && !activeFeeding && (
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
        )}

        {/* Bottle Details */}
        {feedingType === 'bottle' && (
          <Card>
            <CardHeader title="Detalhes da mamadeira" />
            <CardBody className="space-y-4">
              <Input
                label="Quantidade (ml)"
                type="number"
                placeholder="Ex: 120"
                value={bottleMl}
                onChange={(e) => setBottleMl(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                <div className="flex gap-2">
                  {[
                    { value: 'breast_milk', label: 'Leite materno' },
                    { value: 'formula', label: 'Fórmula' },
                    { value: 'mixed', label: 'Misto' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBottleContent(opt.value as typeof bottleContent)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm transition-all',
                        bottleContent === opt.value
                          ? 'bg-olive-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Solid Description */}
        {feedingType === 'solid' && (
          <Card>
            <CardHeader title="Descrição da refeição" />
            <CardBody>
              <Input
                label="O que o bebê comeu?"
                placeholder="Ex: Papinha de banana com aveia"
                value={solidDescription}
                onChange={(e) => setSolidDescription(e.target.value)}
              />
            </CardBody>
          </Card>
        )}

        {/* Complement (for breastfeeding) */}
        {feedingType === 'breast' && activeFeeding && (
          <Card>
            <CardHeader title="Complemento" />
            <CardBody className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={complement}
                  onChange={(e) => setComplement(e.target.checked)}
                  className="w-4 h-4 text-olive-600 rounded"
                />
                <span className="text-sm text-gray-700">Houve complemento?</span>
              </label>
              {complement && (
                <Input
                  label="Quantidade do complemento (ml)"
                  type="number"
                  placeholder="Ex: 30"
                  value={complementMl}
                  onChange={(e) => setComplementMl(e.target.value)}
                />
              )}
            </CardBody>
          </Card>
        )}

        {/* Notes */}
        {activeFeeding && (
          <Card>
            <CardHeader title="Observações" />
            <CardBody>
              <textarea
                className="input min-h-[80px]"
                placeholder="Alguma observação sobre esta alimentação?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardBody>
          </Card>
        )}

        {/* Últimos Registros */}
        <RoutineLastRecordsTable
          babyId={selectedBaby.id}
          routineType="FEEDING"
          routineTypeLabel="Alimentação"
        />
      </div>
    </DashboardLayout>
  );
}
