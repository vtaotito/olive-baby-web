// Olive Baby Web - Babies Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Baby,
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Scale,
  Ruler,
  Check,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Input, Modal, Avatar } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { babyService } from '../../services/api';
import { formatDateBR, formatAge, cn } from '../../lib/utils';
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
  relationship: z.enum(['MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'NANNY', 'OTHER']),
  city: z.string().optional(),
  state: z.string().optional(),
  birthWeightGrams: z.number().min(500).max(7000).optional().or(z.literal('')),
  birthLengthCm: z.number().min(20).max(70).optional().or(z.literal('')),
  babyCpf: z.string().optional(),
});

type BabyFormData = z.infer<typeof babySchema>;

export function BabiesPage() {
  const navigate = useNavigate();
  const { babies, selectedBaby, fetchBabies, selectBaby, addBaby, updateBaby, deleteBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBaby, setEditingBaby] = useState<BabyType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [babyToDelete, setBabyToDelete] = useState<BabyType | null>(null);

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
  });

  const selectedRelationship = watch('relationship');

  useEffect(() => {
    fetchBabies();
  }, [fetchBabies]);

  const openAddModal = () => {
    setEditingBaby(null);
    reset({
      name: '',
      birthDate: '',
      relationship: 'MOTHER',
      city: '',
      state: '',
    });
    setShowModal(true);
  };

  const openEditModal = (baby: BabyType) => {
    setEditingBaby(baby);
    reset({
      name: baby.name,
      birthDate: baby.birthDate.split('T')[0],
      relationship: 'MOTHER', // TODO: Get from baby-caregiver relationship
      city: baby.city || '',
      state: baby.state || '',
      birthWeightGrams: baby.birthWeightGrams || undefined,
      birthLengthCm: baby.birthLengthCm || undefined,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: BabyFormData) => {
    setIsLoading(true);
    try {
      if (editingBaby) {
        await updateBaby(editingBaby.id, {
          name: data.name,
          birthDate: new Date(data.birthDate).toISOString(),
          city: data.city || undefined,
          state: data.state || undefined,
        });
        success('Bebê atualizado!', `${data.name} foi atualizado com sucesso`);
      } else {
        await addBaby({
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
      }
      setShowModal(false);
      reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao salvar bebê');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!babyToDelete) return;
    
    setIsLoading(true);
    try {
      await deleteBaby(babyToDelete.id);
      success('Bebê removido', `${babyToDelete.name} foi removido`);
      setShowDeleteModal(false);
      setBabyToDelete(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao remover bebê');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/settings')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Baby className="w-6 h-6 text-olive-600" />
              Bebês
            </h1>
            <p className="text-gray-500">Gerencie os bebês cadastrados</p>
          </div>
        </div>
        <Button onClick={openAddModal} leftIcon={<Plus className="w-5 h-5" />}>
          Adicionar Bebê
        </Button>
      </div>

      <div className="max-w-2xl space-y-4">
        {babies.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="w-8 h-8 text-olive-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum bebê cadastrado
              </h3>
              <p className="text-gray-500 mb-4">
                Cadastre um bebê para começar a acompanhar
              </p>
              <Button onClick={openAddModal} leftIcon={<Plus className="w-5 h-5" />}>
                Adicionar Bebê
              </Button>
            </CardBody>
          </Card>
        ) : (
          babies.map((baby) => (
            <Card
              key={baby.id}
              className={cn(
                'transition-all',
                selectedBaby?.id === baby.id && 'ring-2 ring-olive-500'
              )}
            >
              <CardBody className="flex items-center gap-4">
                <Avatar name={baby.name} src={baby.photoUrl} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{baby.name}</h3>
                    {selectedBaby?.id === baby.id && (
                      <span className="px-2 py-0.5 bg-olive-100 text-olive-700 text-xs font-medium rounded-full">
                        Selecionado
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">{formatAge(new Date(baby.birthDate))}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateBR(new Date(baby.birthDate))}
                    </span>
                    {baby.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {baby.city}, {baby.state}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/settings/babies/${baby.id}/members`)}
                    title="Gerenciar membros e convites"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  {selectedBaby?.id !== baby.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectBaby(baby)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(baby)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBabyToDelete(baby);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Baby Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBaby ? 'Editar Bebê' : 'Adicionar Bebê'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <>
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
            </>
          )}

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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              {editingBaby ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remover Bebê"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja remover <strong>{babyToDelete?.name}</strong>?
            Todos os registros de rotinas, crescimento e marcos serão removidos permanentemente.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isLoading}
              fullWidth
            >
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
