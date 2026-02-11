// Olive Baby Web - Formulário de Receita
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { prescriptionService } from '../../services/api';
import { format } from 'date-fns';

const schema = z.object({
  prescriptionDate: z.string().min(1, 'Data é obrigatória'),
  validUntil: z.string().optional(),
  instructions: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PrescriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: number;
  visitId?: number;
  onSuccess: () => void;
}

export function PrescriptionFormModal({ isOpen, onClose, babyId, visitId, onSuccess }: PrescriptionFormModalProps) {
  const { success, error: showError } = useToast();
  const [items, setItems] = useState<{ medication: string; dosage: string; frequency?: string; duration?: string }[]>([
    { medication: '', dosage: '', frequency: '', duration: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      prescriptionDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  useEffect(() => {
    if (isOpen) {
      setItems([{ medication: '', dosage: '', frequency: '', duration: '' }]);
    }
  }, [isOpen]);

  const addItem = () => setItems((p) => [...p, { medication: '', dosage: '', frequency: '', duration: '' }]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((p) => p.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setItems((p) => {
      const n = [...p];
      (n[index] as Record<string, string>)[field] = value;
      return n;
    });
  };

  const onSubmit = async (data: FormData) => {
    const validItems = items.filter((i) => i.medication.trim() && i.dosage.trim());
    if (validItems.length === 0) {
      showError('Erro', 'Adicione pelo menos um medicamento com nome e posologia');
      return;
    }

    try {
      const payload = {
        prescriptionDate: new Date(data.prescriptionDate).toISOString(),
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
        instructions: data.instructions || undefined,
        visitId: visitId || undefined,
        items: validItems.map((i) => ({
          medication: i.medication.trim(),
          dosage: i.dosage.trim(),
          frequency: i.frequency?.trim() || undefined,
          duration: i.duration?.trim() || undefined,
        })),
      };

      const res = await prescriptionService.create(babyId, payload);
      if (res.success) {
        success('Receita criada', 'Receita salva com sucesso');
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showError('Erro', e.response?.data?.message || 'Falha ao salvar');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova receita" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Data"
            type="date"
            {...register('prescriptionDate')}
            error={errors.prescriptionDate?.message}
          />
          <Input label="Válida até" type="date" {...register('validUntil')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instruções gerais</label>
          <textarea
            {...register('instructions')}
            rows={2}
            className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medicamentos</label>
            <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addItem}>
              Adicionar
            </Button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    label="Medicamento"
                    value={item.medication}
                    onChange={(e) => updateItem(index, 'medication', e.target.value)}
                    placeholder="Ex: Paracetamol"
                  />
                  <Input
                    label="Posologia"
                    value={item.dosage}
                    onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                    placeholder="Ex: 10 gotas"
                  />
                  <Input
                    label="Frequência"
                    value={item.frequency || ''}
                    onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                    placeholder="Ex: 8/8h"
                  />
                  <Input
                    label="Duração"
                    value={item.duration || ''}
                    onChange={(e) => updateItem(index, 'duration', e.target.value)}
                    placeholder="Ex: 5 dias"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting}>Salvar receita</Button>
        </div>
      </form>
    </Modal>
  );
}
