// Olive Baby Web - Babies Settings Page (Inline Form)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Baby,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Check,
  Users,
  Share2,
  X,
  Scale,
  Ruler,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, Button, Modal, Avatar, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { formatDateBR, formatAge, cn } from '../../lib/utils';
import type { Baby as BabyType, Relationship } from '../../types';

const relationships: { value: Relationship; label: string; emoji: string }[] = [
  { value: 'MOTHER', label: 'Mae', emoji: '👩' },
  { value: 'FATHER', label: 'Pai', emoji: '👨' },
  { value: 'GRANDMOTHER', label: 'Avo', emoji: '👵' },
  { value: 'GRANDFATHER', label: 'Avo', emoji: '👴' },
  { value: 'NANNY', label: 'Baba', emoji: '👩‍🍼' },
  { value: 'OTHER', label: 'Outro', emoji: '👤' },
];

const babySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  birthDate: z.string().min(1, 'Data de nascimento e obrigatoria'),
  relationship: z.enum(['MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'NANNY', 'OTHER']).optional(),
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [babyToDelete, setBabyToDelete] = useState<BabyType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBaby, setEditingBaby] = useState<BabyType | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BabyFormData>({
    resolver: zodResolver(babySchema),
    defaultValues: { relationship: 'MOTHER' },
    mode: 'onChange',
  });

  const selectedRelationship = watch('relationship');

  useEffect(() => {
    fetchBabies();
  }, [fetchBabies]);

  const openAddForm = () => {
    setEditingBaby(null);
    reset({
      name: '',
      birthDate: '',
      relationship: 'MOTHER',
      city: '',
      state: '',
    });
    setShowForm(true);
  };

  const openEditForm = (baby: BabyType) => {
    setEditingBaby(baby);
    const birthLengthCm = baby.birthLengthCm
      ? (typeof baby.birthLengthCm === 'string' ? parseFloat(baby.birthLengthCm) : baby.birthLengthCm)
      : undefined;
    reset({
      name: baby.name,
      birthDate: baby.birthDate.split('T')[0],
      relationship: 'MOTHER',
      city: baby.city || '',
      state: baby.state || '',
      birthWeightGrams: baby.birthWeightGrams || undefined,
      birthLengthCm: birthLengthCm,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBaby(null);
    reset();
  };

  const onSubmit = async (data: BabyFormData) => {
    setIsLoading(true);
    try {
      if (editingBaby) {
        const birthWeightGrams = data.birthWeightGrams && !isNaN(Number(data.birthWeightGrams))
          ? Number(data.birthWeightGrams) : undefined;
        const birthLengthCm = data.birthLengthCm && !isNaN(Number(data.birthLengthCm))
          ? Number(data.birthLengthCm) : undefined;
        await updateBaby(editingBaby.id, {
          name: data.name,
          birthDate: new Date(data.birthDate).toISOString(),
          city: data.city?.trim() || undefined,
          state: data.state?.trim() || undefined,
          birthWeightGrams,
          birthLengthCm,
        });
        success('Bebe atualizado!', `${data.name} foi atualizado com sucesso`);
        await fetchBabies();
      } else {
        if (!data.relationship) {
          showError('Erro', 'Selecione sua relacao com o bebe');
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
        success('Bebe adicionado!', `${data.name} foi cadastrado com sucesso`);
        if (newBaby) selectBaby(newBaby);
      }
      closeForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || error.message || 'Falha ao salvar bebe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!babyToDelete) return;
    setIsLoading(true);
    try {
      await deleteBaby(babyToDelete.id);
      success('Bebe removido', `${babyToDelete.name} foi removido`);
      setShowDeleteModal(false);
      setBabyToDelete(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || 'Falha ao remover bebe');
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
              Bebes
            </h1>
            <p className="text-gray-500">Gerencie os bebes cadastrados</p>
          </div>
        </div>
        <Button
          onClick={() => showForm ? closeForm() : openAddForm()}
          leftIcon={showForm ? <ChevronUp className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? 'Fechar' : 'Adicionar Bebe'}
        </Button>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* ═══ Inline Form ═══ */}
        {showForm && (
          <Card className="border-olive-200 bg-olive-50/30">
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Baby className="w-5 h-5 text-olive-600" />
                  {editingBaby ? 'Editar Bebe' : 'Novo Bebe'}
                </h3>
                <button onClick={closeForm} className="p-1.5 rounded-full hover:bg-gray-200 transition">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(onSubmit)();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome do bebe"
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
                </div>

                {!editingBaby && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sua relacao com o bebe
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {relationships.map((rel) => (
                        <button
                          key={rel.value}
                          type="button"
                          onClick={() => setValue('relationship', rel.value)}
                          className={cn(
                            'p-2.5 rounded-lg border-2 transition-all text-center',
                            selectedRelationship === rel.value
                              ? 'border-olive-500 bg-olive-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          )}
                        >
                          <span className="text-lg block">{rel.emoji}</span>
                          <span className="text-[10px] font-medium">{rel.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label="Peso ao nascer (g)"
                    type="number"
                    placeholder="3200"
                    leftIcon={<Scale className="w-4 h-4" />}
                    {...register('birthWeightGrams', { valueAsNumber: true })}
                  />
                  <Input
                    label="Comprimento (cm)"
                    type="number"
                    step="0.1"
                    placeholder="49.5"
                    leftIcon={<Ruler className="w-4 h-4" />}
                    {...register('birthLengthCm', { valueAsNumber: true })}
                  />
                  <Input
                    label="Cidade"
                    placeholder="Sao Paulo"
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
                    label="CPF do Bebe (opcional)"
                    placeholder="12345678901"
                    maxLength={11}
                    hint="Usado para identificar o bebe de forma unica"
                    {...register('babyCpf')}
                  />
                )}

                {Object.keys(errors).length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {errors.name && <li>{errors.name.message}</li>}
                      {errors.birthDate && <li>{errors.birthDate.message}</li>}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-2 border-t border-gray-200">
                  <Button type="button" variant="secondary" onClick={closeForm} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {editingBaby ? 'Salvar Alteracoes' : 'Adicionar Bebe'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* ═══ Baby List ═══ */}
        {babies.length === 0 && !showForm ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="w-16 h-16 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="w-8 h-8 text-olive-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum bebe cadastrado
              </h3>
              <p className="text-gray-500 mb-4">
                Cadastre um bebe para comecar a acompanhar
              </p>
              <Button onClick={openAddForm} leftIcon={<Plus className="w-5 h-5" />}>
                Adicionar Bebe
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
                    variant="ghost" size="sm"
                    onClick={() => navigate(`/settings/babies/${baby.id}/share`)}
                    title="Compartilhar bebe"
                    className="text-olive-600 hover:text-olive-700 hover:bg-olive-50"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => navigate(`/settings/babies/${baby.id}/members`)}
                    title="Gerenciar membros"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  {selectedBaby?.id !== baby.id && (
                    <Button variant="ghost" size="sm" onClick={() => selectBaby(baby)}>
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEditForm(baby)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { setBabyToDelete(baby); setShowDeleteModal(true); }}
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

      {/* Delete Confirmation Modal (kept - standard confirmation dialog) */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remover Bebe"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja remover <strong>{babyToDelete?.name}</strong>?
            Todos os registros de rotinas, crescimento e marcos serao removidos permanentemente.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} fullWidth>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading} fullWidth>
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
