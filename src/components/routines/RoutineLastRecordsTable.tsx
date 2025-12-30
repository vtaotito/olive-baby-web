// Olive Baby Web - Routine Last Records Table Component
// Tabela compacta com os últimos 5 registros de uma rotina
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Clock, Calendar } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner } from '../ui';
import { useToast } from '../ui/Toast';
import { routineService } from '../../services/api';
import { formatDateBR, formatTimeBR, formatDuration } from '../../lib/utils';
import { RoutineRecordEditModal } from './RoutineRecordEditModal';
import type { RoutineLog, RoutineType } from '../../types';

interface RoutineLastRecordsTableProps {
  babyId: number;
  routineType: RoutineType;
  routineTypeLabel: string;
}

export function RoutineLastRecordsTable({
  babyId,
  routineType,
  routineTypeLabel,
}: RoutineLastRecordsTableProps) {
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();
  const [editingRecord, setEditingRecord] = useState<RoutineLog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Query para buscar últimos 5 registros
  const { data, isLoading } = useQuery({
    queryKey: ['routine-records', routineType, babyId, { limit: 5 }],
    queryFn: async () => {
      const response = await routineService.list(babyId, {
        type: routineType as string,
        limit: 5,
      });
      // Garantir que retorna no máximo 5
      const records = response?.data || [];
      return {
        ...response,
        data: records.slice(0, 5),
      };
    },
  });

  // Mutation para atualizar registro
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return routineService.update(id, data);
    },
    onSuccess: (updatedRecord, variables) => {
      // Atualizar cache local imediatamente
      queryClient.setQueryData(
        ['routine-records', routineType, babyId, { limit: 5 }],
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((record: RoutineLog) =>
              record.id === variables.id ? updatedRecord.data : record
            ),
          };
        }
      );
      // Invalidar outras queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['routines', babyId, routineType] });
      queryClient.invalidateQueries({ queryKey: ['stats', babyId] });
      
      success('Registro alterado', 'O registro foi atualizado com sucesso');
      setShowEditModal(false);
      setEditingRecord(null);
    },
    onError: (err: any) => {
      showError('Erro', err.response?.data?.message || 'Não foi possível alterar o registro');
    },
  });

  const handleEdit = (record: RoutineLog) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const records = data?.data || [];

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Últimos registros</h3>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : records.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              Sem registros recentes
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Data/Hora
                    </th>
                    {routineType !== 'DIAPER' && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Duração
                      </th>
                    )}
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Observações
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: RoutineLog) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatDateBR(new Date(record.startTime))}
                            </div>
                            <div className="text-gray-500">
                              {formatTimeBR(new Date(record.startTime))}
                            </div>
                          </div>
                        </div>
                      </td>
                      {routineType !== 'DIAPER' && (
                        <td className="py-3 px-4">
                          {record.endTime && record.durationSeconds ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(record.durationSeconds)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">
                          {record.notes || '—'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            disabled={updateMutation.isPending}
                            title="Editar registro"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
