// Olive Baby Web - Vaccine Record Inline Form
// Converted from modal to inline responsive form
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Syringe,
  Check,
  Clock,
  SkipForward,
  RotateCcw,
  Trash2,
  Building2,
  User,
  FileText,
  Hash,
  Calendar,
  X,
  ChevronUp,
} from 'lucide-react';
import { Button, Input, Card, CardBody } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { vaccineService } from '../../services/api';
import { cn } from '../../lib/utils';

interface VaccineRecord {
  id: number;
  vaccineKey: string;
  vaccineName: string;
  doseLabel: string;
  doseNumber: number;
  recommendedAt: string;
  appliedAt: string | null;
  status: 'PENDING' | 'APPLIED' | 'SKIPPED';
  source: 'PNI' | 'SBIM';
  lotNumber: string | null;
  clinicName: string | null;
  professionalName: string | null;
  notes: string | null;
  isOverdue: boolean;
  daysUntil: number;
}

interface VaccineRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  record: VaccineRecord | null;
  babyId: number;
  onSuccess: () => void;
}

const applySchema = z.object({
  appliedAt: z.string().min(1, 'Data e obrigatoria'),
  lotNumber: z.string().max(50).optional(),
  clinicName: z.string().max(200).optional(),
  professionalName: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

const skipSchema = z.object({
  notes: z.string().max(500).optional(),
});

const createSchema = z.object({
  vaccineName: z.string().min(1, 'Nome da vacina e obrigatorio'),
  doseLabel: z.string().min(1, 'Dose e obrigatoria'),
  appliedAt: z.string().min(1, 'Data e obrigatoria'),
  lotNumber: z.string().max(50).optional(),
  clinicName: z.string().max(200).optional(),
  professionalName: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;
type SkipFormData = z.infer<typeof skipSchema>;
type CreateFormData = z.infer<typeof createSchema>;

function StatusIcon({ status, isOverdue }: { status: string; isOverdue: boolean }) {
  const config = status === 'APPLIED'
    ? { bg: 'bg-green-100', color: 'text-green-600', Icon: Check }
    : status === 'SKIPPED'
    ? { bg: 'bg-gray-100', color: 'text-gray-500', Icon: SkipForward }
    : isOverdue
    ? { bg: 'bg-red-100', color: 'text-red-600', Icon: Syringe }
    : { bg: 'bg-amber-100', color: 'text-amber-600', Icon: Clock };

  return (
    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', config.bg)}>
      <config.Icon className={cn('w-6 h-6', config.color)} />
    </div>
  );
}

export function VaccineRecordModal({
  isOpen,
  onClose,
  record,
  babyId,
  onSuccess,
}: VaccineRecordFormProps) {
  const { success, error: showError } = useToast();
  const [mode, setMode] = useState<'view' | 'apply' | 'skip' | 'create'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCreating = !record;

  const applyForm = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      appliedAt: new Date().toISOString().split('T')[0],
      lotNumber: '', clinicName: '', professionalName: '', notes: '',
    },
  });

  const skipForm = useForm<SkipFormData>({
    resolver: zodResolver(skipSchema),
    defaultValues: { notes: '' },
  });

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      vaccineName: '', doseLabel: '',
      appliedAt: new Date().toISOString().split('T')[0],
      lotNumber: '', clinicName: '', professionalName: '', notes: '',
    },
  });

  useEffect(() => {
    if (isCreating) {
      setMode('create');
      createForm.reset({
        vaccineName: '', doseLabel: '',
        appliedAt: new Date().toISOString().split('T')[0],
        lotNumber: '', clinicName: '', professionalName: '', notes: '',
      });
    } else if (record) {
      setMode('view');
      applyForm.reset({
        appliedAt: record.appliedAt
          ? new Date(record.appliedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        lotNumber: record.lotNumber || '',
        clinicName: record.clinicName || '',
        professionalName: record.professionalName || '',
        notes: record.notes || '',
      });
      skipForm.reset({ notes: record.notes || '' });
    }
  }, [record, isCreating, applyForm, skipForm, createForm]);

  const handleClose = () => {
    setMode(isCreating ? 'create' : 'view');
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleCreate = async (data: CreateFormData) => {
    setIsSubmitting(true);
    try {
      const response = await vaccineService.createRecord(babyId, {
        vaccineKey: `manual_${Date.now()}`,
        vaccineName: data.vaccineName,
        doseLabel: data.doseLabel,
        doseNumber: 1,
        recommendedAt: data.appliedAt,
        appliedAt: data.appliedAt,
        source: 'PNI',
        lotNumber: data.lotNumber || null,
        clinicName: data.clinicName || null,
        professionalName: data.professionalName || null,
        notes: data.notes || null,
      });
      if (response.success) {
        success('Vacina registrada', `${data.vaccineName} foi registrada com sucesso`);
        onSuccess();
      }
    } catch (err: any) {
      showError('Erro', err.response?.data?.message || 'Falha ao registrar vacina');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async (data: ApplyFormData) => {
    if (!record) return;
    setIsSubmitting(true);
    try {
      const response = await vaccineService.markAsApplied(babyId, record.id, {
        appliedAt: data.appliedAt,
        lotNumber: data.lotNumber || undefined,
        clinicName: data.clinicName || undefined,
        professionalName: data.professionalName || undefined,
        notes: data.notes || undefined,
      });
      if (response.success) {
        success('Vacina registrada', `${record.vaccineName} marcada como aplicada`);
        onSuccess();
      }
    } catch (err: any) {
      showError('Erro', err.response?.data?.message || 'Falha ao registrar vacina');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async (data: SkipFormData) => {
    if (!record) return;
    setIsSubmitting(true);
    try {
      const response = await vaccineService.markAsSkipped(babyId, record.id, data.notes);
      if (response.success) {
        success('Vacina pulada', `${record.vaccineName} marcada como pulada`);
        onSuccess();
      }
    } catch (err: any) {
      showError('Erro', err.response?.data?.message || 'Falha ao registrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!record) return;
    setIsSubmitting(true);
    try {
      const response = await vaccineService.resetToPending(babyId, record.id);
      if (response.success) {
        success('Resetado', `${record.vaccineName} voltou para pendente`);
        onSuccess();
      }
    } catch (err: any) {
      showError('Erro', err.response?.data?.message || 'Falha ao resetar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    setIsDeleting(true);
    try {
      const response = await vaccineService.deleteRecord(babyId, record.id);
      if (response.success) {
        success('Removido', `${record.vaccineName} foi removida`);
        onSuccess();
      }
    } catch (err: any) {
      showError('Erro', err.response?.data?.message || 'Falha ao remover');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="border-olive-200 bg-olive-50/30 mb-6 animate-in slide-in-from-top duration-200">
      <CardBody>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {mode !== 'create' && record ? (
              <>
                <StatusIcon status={record.status} isOverdue={record.isOverdue} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{record.vaccineName}</h3>
                  <p className="text-sm text-gray-500">{record.doseLabel} - Recomendada: {new Date(record.recommendedAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center">
                  <Syringe className="w-6 h-6 text-olive-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Registrar Vacina</h3>
                  <p className="text-sm text-gray-500">Adicione uma vacina manualmente</p>
                </div>
              </>
            )}
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-200 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Create mode */}
        {mode === 'create' && (
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nome da vacina *"
                placeholder="Ex: BCG, Hepatite B"
                error={createForm.formState.errors.vaccineName?.message}
                {...createForm.register('vaccineName')}
              />
              <Input
                label="Dose *"
                placeholder="Ex: 1a dose, dose unica"
                error={createForm.formState.errors.doseLabel?.message}
                {...createForm.register('doseLabel')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Data de aplicacao *"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                error={createForm.formState.errors.appliedAt?.message}
                {...createForm.register('appliedAt')}
              />
              <Input label="Lote" placeholder="12345ABC" {...createForm.register('lotNumber')} />
              <Input label="Local/Servico" placeholder="UBS Centro" {...createForm.register('clinicName')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Profissional" placeholder="Nome do profissional" {...createForm.register('professionalName')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <textarea className="input min-h-[40px] w-full" placeholder="Anotacoes..." {...createForm.register('notes')} />
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
              <Button type="submit" isLoading={isSubmitting}>Registrar</Button>
            </div>
          </form>
        )}

        {/* View mode */}
        {mode === 'view' && record && (
          <div className="space-y-4">
            <div className={cn(
              'p-3 rounded-lg text-sm font-medium',
              record.status === 'APPLIED' ? 'bg-green-50 text-green-800' :
              record.status === 'SKIPPED' ? 'bg-gray-50 text-gray-700' :
              record.isOverdue ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'
            )}>
              {record.status === 'APPLIED' && `Aplicada em ${new Date(record.appliedAt!).toLocaleDateString('pt-BR')}`}
              {record.status === 'SKIPPED' && 'Esta vacina foi pulada'}
              {record.status === 'PENDING' && record.isOverdue && `Atrasada ha ${Math.abs(record.daysUntil)} dias`}
              {record.status === 'PENDING' && !record.isOverdue && (
                record.daysUntil === 0 ? 'Vacina recomendada para hoje' : `Recomendada em ${record.daysUntil} dias`
              )}
            </div>

            {(record.lotNumber || record.clinicName || record.professionalName || record.notes) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {record.lotNumber && (
                  <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Lote:</span><span className="text-gray-900">{record.lotNumber}</span></div>
                )}
                {record.clinicName && (
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Local:</span><span className="text-gray-900">{record.clinicName}</span></div>
                )}
                {record.professionalName && (
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Profissional:</span><span className="text-gray-900">{record.professionalName}</span></div>
                )}
                {record.notes && (
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /><span className="text-gray-500">Obs:</span><span className="text-gray-900">{record.notes}</span></div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              {record.status === 'PENDING' && (
                <>
                  <Button size="sm" onClick={() => setMode('apply')} leftIcon={<Check className="w-4 h-4" />}>Marcar como Aplicada</Button>
                  <Button size="sm" variant="outline" onClick={() => setMode('skip')} leftIcon={<SkipForward className="w-4 h-4" />}>Marcar como Pulada</Button>
                </>
              )}
              {(record.status === 'APPLIED' || record.status === 'SKIPPED') && (
                <>
                  {record.status === 'APPLIED' && (
                    <Button size="sm" variant="outline" onClick={() => setMode('apply')} leftIcon={<Calendar className="w-4 h-4" />}>Editar</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleReset} isLoading={isSubmitting} leftIcon={<RotateCcw className="w-4 h-4" />}>Pendente</Button>
                </>
              )}
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} className="text-sm text-red-600 hover:text-red-700 px-3 py-1">Remover</button>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg">
                  <span className="text-sm text-red-800">Confirmar?</span>
                  <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>Nao</Button>
                  <Button size="sm" variant="danger" onClick={handleDelete} isLoading={isDeleting}>Sim</Button>
                </div>
              )}
              <Button size="sm" variant="ghost" onClick={handleClose} className="ml-auto">Fechar</Button>
            </div>
          </div>
        )}

        {/* Apply mode */}
        {mode === 'apply' && (
          <form onSubmit={applyForm.handleSubmit(handleApply)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Data de aplicacao *"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                error={applyForm.formState.errors.appliedAt?.message}
                {...applyForm.register('appliedAt')}
              />
              <Input label="Lote" placeholder="12345ABC" {...applyForm.register('lotNumber')} />
              <Input label="Local/Servico" placeholder="UBS Centro" {...applyForm.register('clinicName')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Profissional" placeholder="Nome do profissional" {...applyForm.register('professionalName')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <textarea className="input min-h-[40px] w-full" placeholder="Anotacoes..." {...applyForm.register('notes')} />
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <Button type="button" variant="secondary" size="sm" onClick={() => setMode('view')}>Voltar</Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>Salvar</Button>
            </div>
          </form>
        )}

        {/* Skip mode */}
        {mode === 'skip' && (
          <form onSubmit={skipForm.handleSubmit(handleSkip)} className="space-y-3">
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-amber-800">Ao marcar como pulada, esta vacina nao aparecera mais nas pendentes. Voce pode reverter isso a qualquer momento.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (opcional)</label>
              <textarea className="input min-h-[60px] w-full" placeholder="Por que esta vacina foi pulada?" {...skipForm.register('notes')} />
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <Button type="button" variant="secondary" size="sm" onClick={() => setMode('view')}>Voltar</Button>
              <Button type="submit" size="sm" isLoading={isSubmitting} className="bg-gray-600 hover:bg-gray-700">Marcar como Pulada</Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

export default VaccineRecordModal;
