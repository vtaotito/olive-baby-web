// Olive Baby Web - Diaper Tracker Component (Instant - no timer)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, ChevronLeft, Check } from 'lucide-react';
import { DashboardLayout } from '../layout';
import { Card, CardBody, CardHeader, Button } from '../ui';
import { useToast } from '../ui/Toast';
import { RoutineRecordsPanel } from './RoutineRecordsPanel';
import { useBabyStore } from '../../stores/babyStore';
import { routineService } from '../../services/api';
import { cn } from '../../lib/utils';

type DiaperType = 'pee' | 'poop' | 'both';
type Consistency = 'liquid' | 'pasty' | 'solid';

const diaperTypes = [
  { value: 'pee', label: 'Xixi', emoji: '💧', color: 'bg-yellow-100' },
  { value: 'poop', label: 'Cocô', emoji: '💩', color: 'bg-amber-100' },
  { value: 'both', label: 'Ambos', emoji: '💧💩', color: 'bg-orange-100' },
] as const;

const consistencies = [
  { value: 'liquid', label: 'Líquido', emoji: '💧' },
  { value: 'pasty', label: 'Pastoso', emoji: '🥄' },
  { value: 'solid', label: 'Sólido', emoji: '🟤' },
] as const;

const poopColors = [
  { value: 'yellow', label: 'Amarelo', color: 'bg-yellow-400' },
  { value: 'brown', label: 'Marrom', color: 'bg-amber-700' },
  { value: 'green', label: 'Verde', color: 'bg-green-600' },
  { value: 'black', label: 'Preto', color: 'bg-gray-900' },
  { value: 'red', label: 'Vermelho', color: 'bg-red-600' },
  { value: 'white', label: 'Branco', color: 'bg-gray-200' },
];

export function DiaperTracker() {
  const navigate = useNavigate();
  const { selectedBaby, fetchStats } = useBabyStore();
  const { success, error: showError } = useToast();
  
  const [diaperType, setDiaperType] = useState<DiaperType>('pee');
  const [consistency, setConsistency] = useState<Consistency>('pasty');
  const [poopColor, setPoopColor] = useState('yellow');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const meta: Record<string, unknown> = {
        diaperType,
      };
      
      if (diaperType === 'poop' || diaperType === 'both') {
        meta.consistency = consistency;
        meta.color = poopColor;
      }
      
      const response = await routineService.registerDiaper(selectedBaby.id, meta, notes || undefined);
      
      if (response.success) {
        success('Fralda registrada!', getDiaperMessage(diaperType));
        fetchStats(selectedBaby.id);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao registrar fralda');
    } finally {
      setIsLoading(false);
    }
  };

  const getDiaperMessage = (type: DiaperType) => {
    switch (type) {
      case 'pee': return 'Xixi registrado';
      case 'poop': return 'Cocô registrado';
      case 'both': return 'Xixi e cocô registrados';
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
            <Droplets className="w-6 h-6 text-green-600" />
            Troca de Fralda
          </h1>
          <p className="text-gray-500">{selectedBaby.name}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Diaper Type */}
        <Card>
          <CardHeader title="Tipo de fralda" />
          <CardBody>
            <div className="grid grid-cols-3 gap-3">
              {diaperTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDiaperType(type.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                    diaperType === type.value
                      ? 'border-olive-500 bg-olive-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={cn('w-14 h-14 rounded-full flex items-center justify-center', type.color)}>
                    <span className="text-2xl">{type.emoji}</span>
                  </div>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Consistency (for poop) */}
        {(diaperType === 'poop' || diaperType === 'both') && (
          <>
            <Card>
              <CardHeader title="Consistência" />
              <CardBody>
                <div className="grid grid-cols-3 gap-3">
                  {consistencies.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setConsistency(c.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-center',
                        consistency === c.value
                          ? 'border-olive-500 bg-olive-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span className="text-2xl mb-1 block">{c.emoji}</span>
                      <span className="text-sm font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Cor" />
              <CardBody>
                <div className="grid grid-cols-6 gap-2">
                  {poopColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setPoopColor(c.value)}
                      className={cn(
                        'w-12 h-12 rounded-full border-4 transition-all',
                        c.color,
                        poopColor === c.value
                          ? 'border-olive-500 ring-2 ring-olive-200'
                          : 'border-transparent'
                      )}
                      title={c.label}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Selecionado: {poopColors.find(c => c.value === poopColor)?.label}
                </p>
              </CardBody>
            </Card>
          </>
        )}

        {/* Notes */}
        <Card>
          <CardHeader title="Observações" />
          <CardBody>
            <textarea
              className="input min-h-[80px]"
              placeholder="Alguma observação? (rash, irritação, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardBody>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          fullWidth
          size="lg"
          isLoading={isLoading}
          leftIcon={<Check className="w-5 h-5" />}
        >
          Registrar Fralda
        </Button>

        {/* Registros Salvos */}
        <RoutineRecordsPanel
          babyId={selectedBaby.id}
          routineType="DIAPER"
          routineTypeLabel="Fralda"
          limit={10}
        />
      </div>
    </DashboardLayout>
  );
}
