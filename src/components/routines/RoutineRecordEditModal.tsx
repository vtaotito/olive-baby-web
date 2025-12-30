// Olive Baby Web - Routine Record Edit Modal Component
// Modal genérico para editar registros de rotinas
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Input, Button } from '../ui';
import type { RoutineLog, RoutineType } from '../../types';

const routineEditSchema = z.object({
  startTime: z.string().min(1, 'Data/hora de início é obrigatória'),
  endTime: z.string().optional(),
  notes: z.string().optional(),
});

type RoutineEditFormData = z.infer<typeof routineEditSchema>;

interface RoutineRecordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: RoutineLog;
  routineType: RoutineType;
  onSave: (data: {
    startTime?: string;
    endTime?: string;
    notes?: string;
    meta?: Record<string, unknown>;
  }) => void;
  isLoading?: boolean;
}

export function RoutineRecordEditModal({
  isOpen,
  onClose,
  routine,
  routineType,
  onSave,
  isLoading = false,
}: RoutineRecordEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoutineEditFormData>({
    resolver: zodResolver(routineEditSchema),
  });

  useEffect(() => {
    if (isOpen && routine) {
      // Formatar data/hora para input datetime-local
      const startDateTime = new Date(routine.startTime)
        .toISOString()
        .slice(0, 16);
      const endDateTime = routine.endTime
        ? new Date(routine.endTime).toISOString().slice(0, 16)
        : '';

      reset({
        startTime: startDateTime,
        endTime: endDateTime,
        notes: routine.notes || '',
      });
    }
  }, [isOpen, routine, reset]);

  const onSubmit = (data: RoutineEditFormData) => {
    const payload: {
      startTime?: string;
      endTime?: string;
      notes?: string;
      meta?: Record<string, unknown>;
    } = {
      startTime: new Date(data.startTime).toISOString(),
      notes: data.notes || undefined,
    };

    if (data.endTime) {
      payload.endTime = new Date(data.endTime).toISOString();
    }

    // Preservar meta existente
    payload.meta = routine.meta as Record<string, unknown>;

    onSave(payload);
  };

  const getRoutineTypeLabel = () => {
    const labels: Record<RoutineType, string> = {
      FEEDING: 'Alimentação',
      SLEEP: 'Sono',
      DIAPER: 'Fralda',
      BATH: 'Banho',
      MILK_EXTRACTION: 'Extração de Leite',
    };
    return labels[routineType] || routineType;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar ${getRoutineTypeLabel()}`}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Data e Hora de Início"
          type="datetime-local"
          error={errors.startTime?.message}
          {...register('startTime')}
        />

        <Input
          label="Data e Hora de Término (opcional)"
          type="datetime-local"
          error={errors.endTime?.message}
          {...register('endTime')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 resize-none"
            placeholder="Adicione observações sobre este registro..."
            rows={4}
            {...register('notes')}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
