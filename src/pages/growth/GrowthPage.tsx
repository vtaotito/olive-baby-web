// Olive Baby Web - Growth Page
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TrendingUp,
  Scale,
  Ruler,
  Plus,
  Calendar,
  X,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Modal, Spinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { GrowthChart } from '../../components/charts';
import { useBabyStore } from '../../stores/babyStore';
import { growthService } from '../../services/api';
import { formatDateBR } from '../../lib/utils';
import type { Growth } from '../../types';

const growthSchema = z.object({
  measurementDate: z.string().min(1, 'Data é obrigatória'),
  weightGrams: z.number().min(500).max(30000).optional().or(z.literal('')),
  lengthCm: z.number().min(20).max(150).optional().or(z.literal('')),
  headCircumferenceCm: z.number().min(20).max(70).optional().or(z.literal('')),
  notes: z.string().optional(),
});

type GrowthFormData = z.infer<typeof growthSchema>;

export function GrowthPage() {
  const { selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const [growthRecords, setGrowthRecords] = useState<Growth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GrowthFormData>({
    resolver: zodResolver(growthSchema),
    defaultValues: {
      measurementDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (selectedBaby) {
      loadGrowthRecords();
    }
  }, [selectedBaby]);

  const loadGrowthRecords = async () => {
    if (!selectedBaby) return;
    
    setIsLoading(true);
    try {
      const response = await growthService.getAll(selectedBaby.id);
      if (response.success) {
        setGrowthRecords(response.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao carregar registros');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: GrowthFormData) => {
    if (!selectedBaby) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        measurementDate: new Date(data.measurementDate).toISOString(),
        weightGrams: data.weightGrams ? Number(data.weightGrams) : undefined,
        lengthCm: data.lengthCm ? Number(data.lengthCm) : undefined,
        headCircumferenceCm: data.headCircumferenceCm ? Number(data.headCircumferenceCm) : undefined,
        notes: data.notes || undefined,
      };
      
      const response = await growthService.create(selectedBaby.id, payload);
      if (response.success) {
        success('Medida registrada!', 'Registro de crescimento salvo com sucesso');
        setIsModalOpen(false);
        reset();
        loadGrowthRecords();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao salvar registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedBaby || !confirm('Deseja realmente excluir este registro?')) return;
    
    try {
      await growthService.delete(selectedBaby.id, id);
      success('Excluído', 'Registro removido com sucesso');
      loadGrowthRecords();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao excluir');
    }
  };

  // Prepare chart data
  const chartData = growthRecords
    .slice()
    .sort((a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime())
    .map(record => ({
      date: formatDateBR(new Date(record.measurementDate)).slice(0, 5),
      weight: record.weightGrams ? record.weightGrams / 1000 : undefined,
      length: record.lengthCm || undefined,
    }));

  // Get latest measurements
  const latestRecord = growthRecords[0];

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-olive-600" />
            Crescimento
          </h1>
          <p className="text-gray-500">{selectedBaby.name}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-5 h-5" />}>
          Nova Medida
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Latest Stats */}
          {latestRecord && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardBody className="text-center py-4">
                  <div className="w-10 h-10 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Scale className="w-5 h-5 text-olive-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestRecord.weightGrams ? (latestRecord.weightGrams / 1000).toFixed(1) : '-'}
                    <span className="text-sm font-normal text-gray-500"> kg</span>
                  </p>
                  <p className="text-xs text-gray-500">Peso</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center py-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Ruler className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestRecord.lengthCm || '-'}
                    <span className="text-sm font-normal text-gray-500"> cm</span>
                  </p>
                  <p className="text-xs text-gray-500">Altura</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center py-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestRecord.headCircumferenceCm || '-'}
                    <span className="text-sm font-normal text-gray-500"> cm</span>
                  </p>
                  <p className="text-xs text-gray-500">Cabeça</p>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Growth Chart */}
          {chartData.length > 1 && (
            <Card className="mb-6">
              <CardHeader title="Evolução do Crescimento" />
              <CardBody>
                <GrowthChart data={chartData} />
              </CardBody>
            </Card>
          )}

          {/* Records List */}
          <Card>
            <CardHeader title="Histórico de Medidas" />
            <CardBody className="p-0">
              {growthRecords.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum registro de crescimento</p>
                  <p className="text-sm text-gray-400">Clique em "Nova Medida" para adicionar</p>
                </div>
              ) : (
                <div className="divide-y">
                  {growthRecords.map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDateBR(new Date(record.measurementDate))}
                          </p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            {record.weightGrams && (
                              <span>Peso: {(record.weightGrams / 1000).toFixed(1)} kg</span>
                            )}
                            {record.lengthCm && (
                              <span>Altura: {record.lengthCm} cm</span>
                            )}
                            {record.headCircumferenceCm && (
                              <span>Cabeça: {record.headCircumferenceCm} cm</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}

      {/* Add Growth Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Medida de Crescimento">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Data da medição"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            error={errors.measurementDate?.message}
            {...register('measurementDate')}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Peso (gramas)"
              type="number"
              placeholder="Ex: 5200"
              leftIcon={<Scale className="w-5 h-5" />}
              {...register('weightGrams', { valueAsNumber: true })}
            />
            <Input
              label="Altura (cm)"
              type="number"
              step="0.1"
              placeholder="Ex: 58.5"
              leftIcon={<Ruler className="w-5 h-5" />}
              {...register('lengthCm', { valueAsNumber: true })}
            />
          </div>

          <Input
            label="Circunferência da cabeça (cm)"
            type="number"
            step="0.1"
            placeholder="Ex: 38.5"
            {...register('headCircumferenceCm', { valueAsNumber: true })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Alguma observação sobre as medidas?"
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
