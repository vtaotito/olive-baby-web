// Olive Baby Web - Routine Records Panel Component
// Componente genérico para listar e editar registros de rotinas
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2, Clock, Calendar } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner } from '../ui';
import { useToast } from '../ui/Toast';
import { routineService } from '../../services/api';
import { formatDateBR, formatTimeBR, formatDuration } from '../../lib/utils';
import { RoutineRecordEditModal } from './RoutineRecordEditModal';
import type { RoutineLog, RoutineType } from '../../types';

interface RoutineRecordsPanelProps {
  babyId: number;
  routineType: RoutineType;
  routineTypeLabel: string;
  limit?: number;
}

export function RoutineRecordsPanel({
  babyId,
  routineType,
  routineTypeLabel,
  limit = 10,
}: RoutineRecordsPanelProps) {
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();
  const [editingRecord, setEditingRecord] = useState<RoutineLog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Query para buscar registros
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['routines', babyId, routineType],
    queryFn: async () => {
      const response = await routineService.list(babyId, {
        type: routineType,
        limit,
      });
      return response;
    },
  });

  // Mutation para atualizar registro
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return routineService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', babyId, routineType] });
      queryClient.invalidateQueries({ queryKey: ['stats', babyId] });
      success('Registro atualizado!', 'As alterações foram salvas com sucesso');
      setShowEditModal(false);
      setEditingRecord(null);
    },
    onError: (err: any) => {
      showError('Erro', err.response?.data?.message || 'Falha ao atualizar registro');
    },
  });

  // Mutation para deletar registro
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return routineService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', babyId, routineType] });
      queryClient.invalidateQueries({ queryKey: ['stats', babyId] });
      success('Registro removido!', 'O registro foi excluído com sucesso');
    },
    onError: (err: any) => {
      showError('Erro', err.response?.data?.message || 'Falha ao remover registro');
    },
  });

  const handleEdit = (record: RoutineLog) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const records = data?.data || [];

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Registros de {routineTypeLabel}</h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-500 text-center py-4">
            Nenhum registro encontrado
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Registros de {routineTypeLabel}</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {records.map((record: RoutineLog) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDateBR(new Date(record.startTime))}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTimeBR(new Date(record.startTime))}
                    </span>
                  </div>
                  {record.endTime && record.durationSeconds && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(record.durationSeconds)}</span>
                    </div>
                  )}
                  {record.notes && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{record.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(record)}
                    title="Editar registro"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Excluir registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Modal de Edição */}
      {editingRecord && (
        <RoutineRecordEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingRecord(null);
          }}
          routine={editingRecord}
          routineType={routineType}
          onSave={(data) => {
            updateMutation.mutate({ id: editingRecord.id, data });
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </>
  );
}
