// Olive Baby Web - Bath Tracker Component
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bath, ChevronLeft, Thermometer, Sparkles } from 'lucide-react';
import { DashboardLayout } from '../layout';
import { Card, CardBody, CardHeader, Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { Timer } from './Timer';
import { useTimer } from '../../hooks/useTimer';
import { useBabyStore } from '../../stores/babyStore';
import { routineService } from '../../services/api';
import { cn } from '../../lib/utils';

const products = [
  { value: 'shampoo', label: 'Shampoo', emoji: '🧴' },
  { value: 'soap', label: 'Sabonete', emoji: '🧼' },
  { value: 'moisturizer', label: 'Hidratante', emoji: '🧴' },
  { value: 'oil', label: 'Óleo', emoji: '💧' },
];

export function BathTracker() {
  const navigate = useNavigate();
  const { selectedBaby, activeRoutines, setActiveRoutine, fetchStats } = useBabyStore();
  const { success, error: showError } = useToast();
  
  const [temperature, setTemperature] = useState('37');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const activeBath = activeRoutines.bath;
  
  const { seconds, isRunning, start, pause, stop, setSeconds, calculateElapsed } = useTimer();

  useEffect(() => {
    if (activeBath) {
      const elapsed = calculateElapsed(new Date(activeBath.startTime));
      setSeconds(elapsed);
      start(elapsed);
    }
  }, [activeBath, calculateElapsed, setSeconds, start]);

  const toggleProduct = (product: string) => {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product]
    );
  };

  const handleStart = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const meta: Record<string, unknown> = {};
      if (temperature) {
        meta.bathTemperature = Number(temperature);
      }
      
      const response = await routineService.startBath(selectedBaby.id, meta);
      if (response.success) {
        setActiveRoutine('bath', response.data);
        start();
        success('Banho iniciado!', 'O cronômetro está rodando');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao iniciar banho');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const meta: Record<string, unknown> = {};
      if (selectedProducts.length > 0) {
        meta.products = selectedProducts;
      }
      
      const response = await routineService.closeBath(selectedBaby.id, meta, notes || undefined);
      
      if (response.success) {
        setActiveRoutine('bath', undefined);
        stop();
        success('Banho registrado!', `Duração: ${Math.round(response.data.durationSeconds / 60)} minutos`);
        fetchStats(selectedBaby.id);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao finalizar banho');
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
            <Bath className="w-6 h-6 text-purple-600" />
            Banho
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
              color="purple"
            />
          </CardBody>
        </Card>

        {/* Temperature */}
        {!activeBath && (
          <Card>
            <CardHeader title="Temperatura da água" />
            <CardBody>
              <div className="flex items-center gap-4">
                <Thermometer className="w-6 h-6 text-red-500" />
                <Input
                  type="number"
                  step="0.5"
                  placeholder="37"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-24"
                />
                <span className="text-gray-500">°C</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Temperatura ideal: 36-37°C
              </p>
            </CardBody>
          </Card>
        )}

        {/* Products */}
        {activeBath && (
          <Card>
            <CardHeader title="Produtos utilizados" />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <button
                    key={product.value}
                    onClick={() => toggleProduct(product.value)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all flex items-center gap-2',
                      selectedProducts.includes(product.value)
                        ? 'border-olive-500 bg-olive-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-xl">{product.emoji}</span>
                    <span className="text-sm font-medium">{product.label}</span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Notes */}
        {activeBath && (
          <Card>
            <CardHeader title="Observações" />
            <CardBody>
              <textarea
                className="input min-h-[80px]"
                placeholder="Alguma observação sobre este banho?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardBody>
          </Card>
        )}

        {/* Info */}
        {!activeBath && (
          <Card>
            <CardBody className="text-center py-8">
              <div className="w-16 h-16 bg-baby-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Hora do banho de {selectedBaby.name}!
              </h3>
              <p className="text-sm text-gray-500">
                Verifique a temperatura da água e clique em "Iniciar" quando começar o banho.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
