// Olive Baby Web - Growth Page (Improved UI/UX)
import { useState, useEffect, useRef } from 'react';
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
  ChevronUp,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Spinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { WHOGrowthChart } from '../../components/charts';
import { useBabyStore } from '../../stores/babyStore';
import { growthService } from '../../services/api';
import { formatDateBR, cn } from '../../lib/utils';
import type { Growth } from '../../types';

const growthSchema = z.object({
  measurementDate: z.string().min(1, 'Data e obrigatoria'),
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
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

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

  const openForm = () => {
    reset({ measurementDate: new Date().toISOString().split('T')[0] });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const closeForm = () => {
    setShowForm(false);
    reset();
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
        closeForm();
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
      success('Excluido', 'Registro removido com sucesso');
      loadGrowthRecords();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao excluir');
    }
  };

  // Prepare WHO chart data
  const sortedRecords = growthRecords
    .slice()
    .sort((a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime());

  const whoMeasurements = sortedRecords.map(record => ({
    date: record.measurementDate,
    weightKg: record.weightGrams ? record.weightGrams / 1000 : undefined,
    lengthCm: record.lengthCm ? Number(record.lengthCm) : undefined,
    headCm: record.headCircumferenceCm ? Number(record.headCircumferenceCm) : undefined,
  }));

  const latestRecord = growthRecords[0];

  // Calculate deltas
  const previousRecord = growthRecords[1];
  const weightDelta = latestRecord?.weightGrams && previousRecord?.weightGrams
    ? (latestRecord.weightGrams - previousRecord.weightGrams) / 1000
    : null;
  const lengthDelta = latestRecord?.lengthCm && previousRecord?.lengthCm
    ? Number(latestRecord.lengthCm) - Number(previousRecord.lengthCm)
    : null;

  if (!selectedBaby) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Selecione um bebe primeiro</p>
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
          <p className="text-gray-500">{selectedBaby.name} - {growthRecords.length} medicao(oes)</p>
        </div>
        <Button
          onClick={() => showForm ? closeForm() : openForm()}
          leftIcon={showForm ? <ChevronUp className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? 'Fechar' : 'Nova Medida'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Inline Form */}
          <div ref={formRef}>
            {showForm && (
              <Card className="border-olive-200 bg-olive-50/30 mb-6">
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-olive-600" />
                      Nova Medida de Crescimento
                    </h3>
                    <button onClick={closeForm} className="p-1.5 rounded-full hover:bg-gray-200 transition">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input
                        label="Data da medicao"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        error={errors.measurementDate?.message}
                        {...register('measurementDate')}
                      />
                      <Input
                        label="Peso (gramas)"
                        type="number"
                        placeholder="5200"
                        leftIcon={<Scale className="w-4 h-4" />}
                        {...register('weightGrams', { valueAsNumber: true })}
                      />
                      <Input
                        label="Altura (cm)"
                        type="number"
                        step="0.1"
                        placeholder="58.5"
                        leftIcon={<Ruler className="w-4 h-4" />}
                        {...register('lengthCm', { valueAsNumber: true })}
                      />
                      <Input
                        label="Cabeca (cm)"
                        type="number"
                        step="0.1"
                        placeholder="38.5"
                        {...register('headCircumferenceCm', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 resize-none text-sm"
                        placeholder="Alguma observacao sobre as medidas?"
                        rows={2}
                        {...register('notes')}
                      />
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <Button type="button" variant="secondary" onClick={closeForm}>Cancelar</Button>
                      <Button type="submit" isLoading={isSubmitting}>Salvar Medida</Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Latest Stats */}
          {latestRecord && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-olive-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-olive-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {latestRecord.weightGrams ? (latestRecord.weightGrams / 1000).toFixed(1) : '-'}
                    <span className="text-xs font-normal text-gray-500 ml-1">kg</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Peso
                    {weightDelta !== null && (
                      <span className={cn('ml-1', weightDelta >= 0 ? 'text-green-600' : 'text-red-500')}>
                        {weightDelta >= 0 ? '+' : ''}{weightDelta.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Ruler className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {latestRecord.lengthCm || '-'}
                    <span className="text-xs font-normal text-gray-500 ml-1">cm</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Altura
                    {lengthDelta !== null && (
                      <span className={cn('ml-1', lengthDelta >= 0 ? 'text-green-600' : 'text-red-500')}>
                        {lengthDelta >= 0 ? '+' : ''}{lengthDelta.toFixed(1)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-none">
                    {latestRecord.headCircumferenceCm || '-'}
                    <span className="text-xs font-normal text-gray-500 ml-1">cm</span>
                  </p>
                  <p className="text-xs text-gray-500">Cabeca</p>
                </div>
              </div>
            </div>
          )}

          {/* WHO Growth Chart */}
          {selectedBaby.birthDate && whoMeasurements.length > 0 && (
            <Card className="mb-6">
              <CardHeader
                title="Curvas de Crescimento OMS"
                subtitle={`${whoMeasurements.length} medicao(oes) - Referencia: OMS 0-24 meses`}
              />
              <CardBody>
                <WHOGrowthChart
                  birthDate={selectedBaby.birthDate}
                  measurements={whoMeasurements}
                />
              </CardBody>
            </Card>
          )}

          {/* Records History */}
          <Card>
            <CardHeader title="Historico de Medidas" subtitle={`${growthRecords.length} registro(s)`} />
            <CardBody className="p-0">
              {growthRecords.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum registro de crescimento</p>
                  <p className="text-sm text-gray-400 mb-4">Clique em "Nova Medida" para adicionar</p>
                  <Button onClick={openForm} leftIcon={<Plus className="w-4 h-4" />} size="sm">
                    Adicionar primeira medida
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2.5 px-4 text-gray-500 font-medium">Data</th>
                        <th className="text-right py-2.5 px-4 text-gray-500 font-medium">Peso</th>
                        <th className="text-right py-2.5 px-4 text-gray-500 font-medium">Altura</th>
                        <th className="text-right py-2.5 px-4 text-gray-500 font-medium">Cabeca</th>
                        <th className="text-right py-2.5 px-4 text-gray-500 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {growthRecords.map((record, idx) => {
                        const prev = growthRecords[idx + 1];
                        const wNow = record.weightGrams ? record.weightGrams / 1000 : null;
                        const wPrev = prev?.weightGrams ? prev.weightGrams / 1000 : null;
                        const wDelta = wNow && wPrev ? wNow - wPrev : null;
                        return (
                          <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="py-2.5 px-4 text-gray-900 font-medium">
                              {formatDateBR(new Date(record.measurementDate))}
                            </td>
                            <td className="py-2.5 px-4 text-right text-gray-700">
                              {record.weightGrams ? (
                                <div>
                                  {(record.weightGrams / 1000).toFixed(2)} kg
                                  {wDelta !== null && (
                                    <span className={cn('block text-xs', wDelta >= 0 ? 'text-green-600' : 'text-red-500')}>
                                      {wDelta >= 0 ? '+' : ''}{wDelta.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right text-gray-700">
                              {record.lengthCm ? `${record.lengthCm} cm` : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right text-gray-700">
                              {record.headCircumferenceCm ? `${record.headCircumferenceCm} cm` : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
