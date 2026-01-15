// Olive Baby Web - Vaccine Record Modal
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
} from 'lucide-react';
import { Modal, Button, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { vaccineService } from '../../services/api';
import { cn } from '../../lib/utils';

// Types
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

interface VaccineRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: VaccineRecord | null;
  babyId: number;
  onSuccess: () => void;
}

// Validation schemas
const applySchema = z.object({
  appliedAt: z.string().min(1, 'Data é obrigatória'),
  lotNumber: z.string().max(50).optional(),
  clinicName: z.string().max(200).optional(),
  professionalName: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

const skipSchema = z.object({
  notes: z.string().max(500).optional(),
});

type ApplyFormData = z.infer<typeof applySchema>;
type SkipFormData = z.infer<typeof skipSchema>;

// Status icon
function StatusIcon({ status, isOverdue }: { status: string; isOverdue: boolean }) {
  if (status === 'APPLIED') {
    return (
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-600" />
      </div>
    );
  }
  
  if (status === 'SKIPPED') {
    return (
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <SkipForward className="w-8 h-8 text-gray-500" />
      </div>
    );
  }
  
  if (isOverdue) {
    return (
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <Syringe className="w-8 h-8 text-red-600" />
      </div>
    );
  }
  
  return (
    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
      <Clock className="w-8 h-8 text-amber-600" />
    </div>
  );
}

export function VaccineRecordModal({
  isOpen,
  onClose,
  record,
  babyId,
  onSuccess,
}: VaccineRecordModalProps) {
  const { success, error: showError } = useToast();
  const [mode, setMode] = useState<'view' | 'apply' | 'skip'>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Apply form
  const applyForm = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      appliedAt: new Date().toISOString().split('T')[0],
      lotNumber: '',
      clinicName: '',
      professionalName: '',
      notes: '',
    },
  });

  // Skip form
  const skipForm = useForm<SkipFormData>({
    resolver: zodResolver(skipSchema),
    defaultValues: {
      notes: '',
    },
  });

  // Reset forms when record changes
  useEffect(() => {
    if (record) {
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
      skipForm.reset({
        notes: record.notes || '',
      });
    }
  }, [record, applyForm, skipForm]);

  // Handle close
  const handleClose = () => {
    setMode('view');
    setShowDeleteConfirm(false);
    onClose();
  };

  // Handle apply
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

  // Handle skip
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

  // Handle reset
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

  // Handle delete
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

  if (!record) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title=""
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <StatusIcon status={record.status} isOverdue={record.isOverdue} />
          <h2 className="text-xl font-bold text-gray-900 mt-4">
            {record.vaccineName}
          </h2>
          <p className="text-gray-500">{record.doseLabel}</p>
          <p className="text-sm text-gray-400 mt-1">
            Recomendada: {new Date(record.recommendedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* View mode */}
        {mode === 'view' && (
          <>
            {/* Status info */}
            <div className={cn(
              'p-4 rounded-lg',
              record.status === 'APPLIED' ? 'bg-green-50' :
              record.status === 'SKIPPED' ? 'bg-gray-50' :
              record.isOverdue ? 'bg-red-50' : 'bg-amber-50'
            )}>
              <p className={cn(
                'font-medium',
                record.status === 'APPLIED' ? 'text-green-800' :
                record.status === 'SKIPPED' ? 'text-gray-700' :
                record.isOverdue ? 'text-red-800' : 'text-amber-800'
              )}>
                {record.status === 'APPLIED' && `Aplicada em ${new Date(record.appliedAt!).toLocaleDateString('pt-BR')}`}
                {record.status === 'SKIPPED' && 'Esta vacina foi pulada'}
                {record.status === 'PENDING' && record.isOverdue && `Atrasada há ${Math.abs(record.daysUntil)} dias`}
                {record.status === 'PENDING' && !record.isOverdue && (
                  record.daysUntil === 0 
                    ? 'Vacina recomendada para hoje'
                    : `Recomendada em ${record.daysUntil} dias`
                )}
              </p>
            </div>

            {/* Details */}
            {(record.lotNumber || record.clinicName || record.professionalName || record.notes) && (
              <div className="space-y-3 border-t pt-4">
                {record.lotNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Lote:</span>
                    <span className="text-gray-900">{record.lotNumber}</span>
                  </div>
                )}
                {record.clinicName && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Local:</span>
                    <span className="text-gray-900">{record.clinicName}</span>
                  </div>
                )}
                {record.professionalName && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Profissional:</span>
                    <span className="text-gray-900">{record.professionalName}</span>
                  </div>
                )}
                {record.notes && (
                  <div className="flex items-start gap-3 text-sm">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-500">Obs:</span>
                    <span className="text-gray-900">{record.notes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {record.status === 'PENDING' && (
                <>
                  <Button
                    fullWidth
                    onClick={() => setMode('apply')}
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    Marcar como Aplicada
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => setMode('skip')}
                    leftIcon={<SkipForward className="w-4 h-4" />}
                  >
                    Marcar como Pulada
                  </Button>
                </>
              )}
              
              {(record.status === 'APPLIED' || record.status === 'SKIPPED') && (
                <>
                  {record.status === 'APPLIED' && (
                    <Button
                      fullWidth
                      variant="outline"
                      onClick={() => setMode('apply')}
                      leftIcon={<Calendar className="w-4 h-4" />}
                    >
                      Editar Registro
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={handleReset}
                    isLoading={isSubmitting}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Voltar para Pendente
                  </Button>
                </>
              )}

              {/* Delete option */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-center text-sm text-red-600 hover:text-red-700 py-2"
                >
                  Remover registro
                </button>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg space-y-3">
                  <p className="text-sm text-red-800">
                    Tem certeza que deseja remover este registro?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      fullWidth
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleDelete}
                      isLoading={isDeleting}
                      fullWidth
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Apply mode */}
        {mode === 'apply' && (
          <form onSubmit={applyForm.handleSubmit(handleApply)} className="space-y-4">
            <Input
              label="Data de aplicação *"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              error={applyForm.formState.errors.appliedAt?.message}
              {...applyForm.register('appliedAt')}
            />

            <Input
              label="Lote da vacina"
              placeholder="Ex: 12345ABC"
              {...applyForm.register('lotNumber')}
            />

            <Input
              label="Local/Serviço"
              placeholder="Ex: UBS Centro, Hospital São Lucas"
              {...applyForm.register('clinicName')}
            />

            <Input
              label="Profissional"
              placeholder="Nome do profissional que aplicou"
              {...applyForm.register('professionalName')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Anotações adicionais..."
                {...applyForm.register('notes')}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMode('view')}
                fullWidth
              >
                Voltar
              </Button>
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
              >
                Salvar
              </Button>
            </div>
          </form>
        )}

        {/* Skip mode */}
        {mode === 'skip' && (
          <form onSubmit={skipForm.handleSubmit(handleSkip)} className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                Ao marcar como pulada, esta vacina não aparecerá mais nas pendentes.
                Você pode reverter isso a qualquer momento.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo (opcional)
              </label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Por que esta vacina foi pulada?"
                {...skipForm.register('notes')}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMode('view')}
                fullWidth
              >
                Voltar
              </Button>
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Marcar como Pulada
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default VaccineRecordModal;
