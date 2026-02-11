// Olive Baby Web - Formulário de Consulta (Prontuário)
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { clinicalVisitService } from '../../services/api';
import { format } from 'date-fns';

const VISIT_TYPES = [
  { value: 'CONSULTA_ROTINA', label: 'Consulta de rotina' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'URGENCIA', label: 'Urgência' },
  { value: 'VACINA', label: 'Vacina' },
  { value: 'OUTRO', label: 'Outro' },
] as const;

const schema = z.object({
  visitDate: z.string().min(1, 'Data é obrigatória'),
  visitType: z.enum(['CONSULTA_ROTINA', 'RETORNO', 'URGENCIA', 'VACINA', 'OUTRO']),
  chiefComplaint: z.string().optional(),
  history: z.string().optional(),
  physicalExam: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  weightKg: z.union([z.number(), z.string()]).optional(),
  heightCm: z.union([z.number(), z.string()]).optional(),
  headCircumferenceCm: z.union([z.number(), z.string()]).optional(),
  nextVisitDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface VisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: number;
  visit?: { id: number } & Partial<FormData>;
  onSuccess: () => void;
}

export function VisitFormModal({ isOpen, onClose, babyId, visit, onSuccess }: VisitFormModalProps) {
  const { success, error: showError } = useToast();
  const isEdit = !!visit?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      visitDate: format(new Date(), 'yyyy-MM-dd'),
      visitType: 'CONSULTA_ROTINA',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (visit) {
        reset({
          visitDate: visit.visitDate ? format(new Date(visit.visitDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          visitType: (visit.visitType as FormData['visitType']) || 'CONSULTA_ROTINA',
          chiefComplaint: visit.chiefComplaint || '',
          history: visit.history || '',
          physicalExam: visit.physicalExam || '',
          assessment: visit.assessment || '',
          plan: visit.plan || '',
          weightKg: visit.weightKg ?? '',
          heightCm: visit.heightCm ?? '',
          headCircumferenceCm: visit.headCircumferenceCm ?? '',
          nextVisitDate: visit.nextVisitDate ? format(new Date(visit.nextVisitDate), 'yyyy-MM-dd') : '',
        });
      } else {
        reset({
          visitDate: format(new Date(), 'yyyy-MM-dd'),
          visitType: 'CONSULTA_ROTINA',
          chiefComplaint: '',
          history: '',
          physicalExam: '',
          assessment: '',
          plan: '',
          weightKg: '',
          heightCm: '',
          headCircumferenceCm: '',
          nextVisitDate: '',
        });
      }
    }
  }, [isOpen, visit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        visitDate: new Date(data.visitDate).toISOString(),
        visitType: data.visitType,
        chiefComplaint: data.chiefComplaint || undefined,
        history: data.history || undefined,
        physicalExam: data.physicalExam || undefined,
        assessment: data.assessment || undefined,
        plan: data.plan || undefined,
        weightKg: data.weightKg ? Number(data.weightKg) : undefined,
        heightCm: data.heightCm ? Number(data.heightCm) : undefined,
        headCircumferenceCm: data.headCircumferenceCm ? Number(data.headCircumferenceCm) : undefined,
        nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate).toISOString() : undefined,
      };

      if (isEdit && visit?.id) {
        const res = await clinicalVisitService.update(babyId, visit.id, payload);
        if (res.success) {
          success('Consulta atualizada', 'Registro salvo com sucesso');
          onSuccess();
          onClose();
        }
      } else {
        const res = await clinicalVisitService.create(babyId, payload);
        if (res.success) {
          success('Consulta registrada', 'Consulta salva com sucesso');
          onSuccess();
          onClose();
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showError('Erro', e.response?.data?.message || 'Falha ao salvar');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar consulta' : 'Nova consulta'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Data"
            type="date"
            {...register('visitDate')}
            error={errors.visitDate?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <select
              {...register('visitType')}
              className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {VISIT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Input label="Queixa principal" {...register('chiefComplaint')} error={errors.chiefComplaint?.message} />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">História / Anamnese</label>
          <textarea
            {...register('history')}
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exame físico</label>
          <textarea
            {...register('physicalExam')}
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avaliação</label>
          <textarea
            {...register('assessment')}
            rows={2}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conduta / Plano</label>
          <textarea
            {...register('plan')}
            rows={2}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Peso (kg)"
            type="number"
            step="0.01"
            {...register('weightKg')}
            error={errors.weightKg?.message}
          />
          <Input
            label="Comprimento (cm)"
            type="number"
            step="0.1"
            {...register('heightCm')}
            error={errors.heightCm?.message}
          />
          <Input
            label="PC (cm)"
            type="number"
            step="0.1"
            {...register('headCircumferenceCm')}
            error={errors.headCircumferenceCm?.message}
          />
        </div>

        <Input label="Próxima consulta" type="date" {...register('nextVisitDate')} />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
