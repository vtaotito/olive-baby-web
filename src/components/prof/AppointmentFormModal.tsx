// Olive Baby Web - Formulário de Agendamento
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { appointmentService, professionalService } from '../../services/api';
import { format } from 'date-fns';

const APPT_TYPES = [
  { value: 'CONSULTA_ROTINA', label: 'Consulta de rotina' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'VACINA', label: 'Vacina' },
  { value: 'URGENCIA', label: 'Urgência' },
  { value: 'TELEMEDICINA', label: 'Telemedicina' },
  { value: 'OUTRO', label: 'Outro' },
] as const;

const schema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário é obrigatório'),
  babyId: z.number().min(1, 'Selecione o paciente'),
  type: z.enum(['CONSULTA_ROTINA', 'RETORNO', 'VACINA', 'URGENCIA', 'TELEMEDICINA', 'OUTRO']),
  durationMinutes: z.number().min(15).max(120).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  onSuccess: () => void;
}

export function AppointmentFormModal({ isOpen, onClose, defaultDate, onSuccess }: AppointmentFormModalProps) {
  const { success, error: showError } = useToast();
  const [patients, setPatients] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      type: 'CONSULTA_ROTINA',
      durationMinutes: 30,
    },
  });

  useEffect(() => {
    if (isOpen) {
      professionalService.getMyPatients().then((r) => setPatients(r?.data || []));
      reset({
        date: (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
        startTime: '09:00',
        type: 'CONSULTA_ROTINA',
        durationMinutes: 30,
        notes: '',
      });
    }
  }, [isOpen, defaultDate, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const startAt = new Date(`${data.date}T${data.startTime}:00`);
      const payload = {
        babyId: data.babyId,
        startAt: startAt.toISOString(),
        durationMinutes: data.durationMinutes || 30,
        type: data.type,
        notes: data.notes || undefined,
      };

      const res = await appointmentService.create(payload);
      if (res.success) {
        success('Agendamento criado', 'Consulta agendada com sucesso');
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showError('Erro', e.response?.data?.message || 'Falha ao agendar');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo agendamento" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paciente</label>
          <select
            {...register('babyId', { valueAsNumber: true })}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value={0}>Selecione...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.babyId && <p className="text-sm text-red-600 mt-1">{errors.babyId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data"
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />
          <Input
            label="Horário"
            type="time"
            {...register('startTime')}
            error={errors.startTime?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
          <select
            {...register('type')}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            {APPT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <Input
          label="Duração (min)"
          type="number"
          min={15}
          max={120}
          step={15}
          {...register('durationMinutes', { valueAsNumber: true })}
          error={errors.durationMinutes?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting}>Agendar</Button>
        </div>
      </form>
    </Modal>
  );
}
