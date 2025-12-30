// Olive Baby Web - Babies Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Check,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button, Modal, Avatar } from '../../components/ui';
import { BabyModal } from '../../components/babies';
import { useToast } from '../../components/ui/Toast';
import { useBabyStore } from '../../stores/babyStore';
import { useModalStore } from '../../stores/modalStore';
import { formatDateBR, formatAge, cn } from '../../lib/utils';
import type { Baby as BabyType } from '../../types';

// Wrapper para usar o modal do store
function BabyModalWrapper() {
  const { babyModalOpen, editingBaby, closeBabyModal } = useModalStore();
  return (
    <BabyModal
      isOpen={babyModalOpen}
      onClose={closeBabyModal}
      editingBaby={editingBaby}
    />
  );
}

export function BabiesPage() {
  const navigate = useNavigate();
  const { babies, selectedBaby, fetchBabies, selectBaby, deleteBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const { openBabyModal } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [babyToDelete, setBabyToDelete] = useState<BabyType | null>(null);

  useEffect(() => {
    fetchBabies();
  }, [fetchBabies]);

  const openAddModal = () => {
    openBabyModal(null);
  };

  const openEditModal = (baby: BabyType) => {
    openBabyModal(baby);
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

      {/* Baby Modal - Usando componente compartilhado */}
      <BabyModalWrapper />

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
