// Olive Baby Web - Baby Modal Component (Compartilhado)
// Modal reutilizável para adicionar ou editar bebê
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Scale,
  Ruler,
  Plus,
} from 'lucide-react';
import { Modal, Input, Button } from '../ui';
import { useToast } from '../ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { useModalStore } from '../../stores/modalStore';
import { cn } from '../../lib/utils';
import type { Baby as BabyType, Relationship } from '../../types';

const relationships: { value: Relationship; label: string; emoji: string }[] = [
  { value: 'MOTHER', label: 'Mãe', emoji: '👩' },
  { value: 'FATHER', label: 'Pai', emoji: '👨' },
  { value: 'GRANDMOTHER', label: 'Avó', emoji: '👵' },
  { value: 'GRANDFATHER', label: 'Avô', emoji: '👴' },
  { value: 'NANNY', label: 'Babá', emoji: '👩‍🍼' },
  { value: 'OTHER', label: 'Outro', emoji: '👤' },
];

const babySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  relationship: z.enum(['MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'NANNY', 'OTHER']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  birthWeightGrams: z.number().min(500).max(7000).optional().or(z.literal('')),
  birthLengthCm: z.number().min(20).max(70).optional().or(z.literal('')),
  babyCpf: z.string().optional(),
});

type BabyFormData = z.infer<typeof babySchema>;

interface BabyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBaby?: BabyType | null;
}

export function BabyModal({ isOpen, onClose, editingBaby: propEditingBaby }: BabyModalProps) {
  // Usar editingBaby do prop ou do store
  const { editingBaby: storeEditingBaby, closeBabyModal } = useModalStore();
  const editingBaby = propEditingBaby ?? storeEditingBaby;
  const { addBaby, updateBaby, fetchBabies, selectBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BabyFormData>({
    resolver: zodResolver(babySchema),
    defaultValues: {
      relationship: 'MOTHER',
    },
    mode: 'onChange',
  });

  const selectedRelationship = watch('relationship');

  // Reset form quando modal abre/fecha ou editingBaby muda
  useEffect(() => {
    if (isOpen) {
      if (editingBaby) {
        reset({
          name: editingBaby.name,
          birthDate: editingBaby.birthDate.split('T')[0],
          relationship: 'MOTHER', // TODO: Get from baby-caregiver relationship
          city: editingBaby.city || '',
          state: editingBaby.state || '',
          birthWeightGrams: editingBaby.birthWeightGrams || undefined,
          birthLengthCm: editingBaby.birthLengthCm || undefined,
        });
      } else {
        reset({
          name: '',
          birthDate: '',
          relationship: 'MOTHER',
          city: '',
          state: '',
        });
      }
    }
  }, [isOpen, editingBaby, reset]);

  const onSubmit = async (data: BabyFormData) => {
    setIsLoading(true);
    try {
      if (editingBaby) {
        const updateData = {
          name: data.name,
          birthDate: new Date(data.birthDate).toISOString(),
          city: data.city || undefined,
          state: data.state || undefined,
          birthWeightGrams: data.birthWeightGrams ? Number(data.birthWeightGrams) : undefined,
          birthLengthCm: data.birthLengthCm ? Number(data.birthLengthCm) : undefined,
        };
        await updateBaby(editingBaby.id, updateData);
        success('Bebê atualizado!', `${data.name} foi atualizado com sucesso`);
        // Atualizar lista de bebês
        await fetchBabies();
      } else {
        if (!data.relationship) {
          showError('Erro', 'Selecione sua relação com o bebê');
          setIsLoading(false);
          return;
        }
        const newBaby = await addBaby({
          name: data.name,
          birthDate: new Date(data.birthDate).toISOString(),
          relationship: data.relationship,
          city: data.city || undefined,
          state: data.state || undefined,
          birthWeightGrams: data.birthWeightGrams ? Number(data.birthWeightGrams) : undefined,
          birthLengthCm: data.birthLengthCm ? Number(data.birthLengthCm) : undefined,
          babyCpf: data.babyCpf || undefined,
        });
        success('Bebê adicionado!', `${data.name} foi cadastrado com sucesso`);
        // Selecionar o novo bebê
        if (newBaby) {
          selectBaby(newBaby);
        }
      }
      onClose();
      closeBabyModal();
      reset();
    } catch (err: unknown) {
      console.error('Error saving baby:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || error.message || 'Falha ao salvar bebê');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBaby ? 'Editar Bebê' : 'Adicionar Bebê'}
    >
      <form 
        onSubmit={(e) => {
          e.stopPropagation();
          handleSubmit(onSubmit, (errors) => {
            console.error('Form validation errors:', errors);
          })(e);
        }} 
        className="space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          label="Nome do bebê"
          placeholder="Ex: Maria Oliveira"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Data de nascimento"
          type="date"
          max={new Date().toISOString().split('T')[0]}
          error={errors.birthDate?.message}
          {...register('birthDate')}
        />

        {!editingBaby && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sua relação com o bebê
            </label>
            <div className="grid grid-cols-3 gap-2">
              {relationships.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  onClick={() => setValue('relationship', rel.value)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-center',
                    selectedRelationship === rel.value
                      ? 'border-olive-500 bg-olive-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-xl block">{rel.emoji}</span>
                  <span className="text-xs font-medium">{rel.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Peso ao nascer (g)"
            type="number"
            placeholder="3200"
            leftIcon={<Scale className="w-5 h-5" />}
            {...register('birthWeightGrams', { valueAsNumber: true })}
          />
          <Input
            label="Comprimento (cm)"
            type="number"
            step="0.1"
            placeholder="49.5"
            leftIcon={<Ruler className="w-5 h-5" />}
            {...register('birthLengthCm', { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cidade"
            placeholder="São Paulo"
            {...register('city')}
          />
          <Input
            label="Estado"
            placeholder="SP"
            maxLength={2}
            {...register('state')}
          />
        </div>

        {!editingBaby && (
          <Input
            label="CPF do Bebê (opcional)"
            placeholder="12345678901"
            maxLength={11}
            hint="Usado para identificar o bebê de forma única e permitir compartilhamento"
            {...register('babyCpf')}
          />
        )}

        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Erros de validação:</p>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {errors.name && <li>{errors.name.message}</li>}
              {errors.birthDate && <li>{errors.birthDate.message}</li>}
              {errors.relationship && <li>{errors.relationship.message}</li>}
              {errors.birthWeightGrams && <li>{errors.birthWeightGrams.message}</li>}
              {errors.birthLengthCm && <li>{errors.birthLengthCm.message}</li>}
            </ul>
          </div>
        )}
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
            {editingBaby ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
