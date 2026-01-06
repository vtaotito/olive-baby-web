// Olive Baby Web - Routine Last Records Table Component
// Tabela compacta com os últimos 5 registros de uma rotina
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Clock, Calendar, Info } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner } from '../ui';
import { useToast } from '../ui/Toast';
import { routineService } from '../../services/api';
import { formatDateBR, formatTimeBR, formatDuration } from '../../lib/utils';
import { RoutineRecordEditModal } from './RoutineRecordEditModal';
import type { RoutineLog, RoutineType, FeedingMeta, SleepMeta, DiaperMeta, BathMeta, MilkExtractionMeta } from '../../types';
import {
  FEEDING_TYPES,
  BREAST_SIDES,
  SLEEP_QUALITIES,
  DIAPER_TYPES,
  EXTRACTION_METHODS,
} from '../../utils/routineMeta';

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

  // Formatar resumo do meta para exibição
  const getMetaSummary = (record: RoutineLog): string => {
    const meta = record.meta as Record<string, unknown>;
    if (!meta || Object.keys(meta).length === 0) return '';

    switch (record.routineType) {
      case 'FEEDING': {
        const feedingMeta = meta as unknown as FeedingMeta;
        const parts: string[] = [];
        
        const typeLabel = FEEDING_TYPES.find(t => t.value === feedingMeta.feedingType)?.label;
        if (typeLabel) parts.push(typeLabel);
        
        if (feedingMeta.feedingType === 'breast' && feedingMeta.breastSide) {
          const sideLabel = BREAST_SIDES.find(s => s.value === feedingMeta.breastSide)?.label;
          if (sideLabel) parts.push(`Lado ${sideLabel}`);
        }
        
        if (feedingMeta.feedingType === 'bottle' && feedingMeta.bottleMl) {
          parts.push(`${feedingMeta.bottleMl}ml`);
        }
        
        if (feedingMeta.complement === 'yes' && feedingMeta.complementMl) {
          // Determinar tipo de complemento para exibição
          let complementTypeLabel = '';
          if (feedingMeta.complementIsMixed) {
            complementTypeLabel = ' (Misto)';
          } else if (feedingMeta.complementType === 'donated_milk' || feedingMeta.complementType === 'breast_milk') {
            complementTypeLabel = ' (LM)';
          } else if (feedingMeta.complementType === 'formula') {
            complementTypeLabel = ' (Fórmula)';
          }
          parts.push(`+${feedingMeta.complementMl}ml complemento${complementTypeLabel}`);
        }
        
        return parts.join(' • ');
      }
      
      case 'SLEEP': {
        const sleepMeta = meta as SleepMeta;
        const parts: string[] = [];
        
        const quality = sleepMeta.sleepQuality || sleepMeta.quality;
        if (quality) {
          const qualityLabel = SLEEP_QUALITIES.find(q => q.value === quality)?.label;
          if (qualityLabel) parts.push(`Qualidade: ${qualityLabel}`);
        }
        
        if (sleepMeta.wokeUpTimes !== undefined && sleepMeta.wokeUpTimes > 0) {
          parts.push(`Acordou ${sleepMeta.wokeUpTimes}x`);
        }
        
        return parts.join(' • ');
      }
      
      case 'DIAPER': {
        const diaperMeta = meta as unknown as DiaperMeta;
        const parts: string[] = [];
        
        const typeLabel = DIAPER_TYPES.find(t => t.value === diaperMeta.diaperType)?.label;
        if (typeLabel) parts.push(typeLabel);
        
        if (diaperMeta.consistency) {
          parts.push(diaperMeta.consistency);
        }
        
        if (diaperMeta.color) {
          parts.push(`cor: ${diaperMeta.color}`);
        }
        
        return parts.join(' • ');
      }
      
      case 'BATH': {
        const bathMeta = meta as BathMeta;
        const parts: string[] = [];
        
        const temp = bathMeta.bathTemperature || bathMeta.waterTemperature;
        if (temp) {
          parts.push(`${temp}°C`);
        }
        
        const products = bathMeta.products || bathMeta.productsUsed || [];
        if (products.length > 0) {
          parts.push(`${products.length} produtos`);
        }
        
        if (bathMeta.hairWashed) {
          parts.push('Lavou cabelo');
        }
        
        return parts.join(' • ');
      }
      
      case 'MILK_EXTRACTION': {
        const extractionMeta = meta as MilkExtractionMeta;
        const parts: string[] = [];
        
        const method = extractionMeta.extractionMethod || extractionMeta.extractionType;
        if (method) {
          const methodLabel = EXTRACTION_METHODS.find(m => m.value === method)?.label;
          if (methodLabel) parts.push(methodLabel);
        }
        
        if (extractionMeta.breastSide) {
          const sideLabel = BREAST_SIDES.find(s => s.value === extractionMeta.breastSide)?.label;
          if (sideLabel) parts.push(`Lado ${sideLabel}`);
        }
        
        const qty = extractionMeta.extractionMl || extractionMeta.quantityMl;
        if (qty) {
          parts.push(`${qty}ml`);
        }
        
        return parts.join(' • ');
      }
      
      default:
        return '';
    }
  };

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
                      Detalhes
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
                        <div className="max-w-xs">
                          {/* Resumo do meta */}
                          {getMetaSummary(record) && (
                            <p className="text-sm text-gray-800 font-medium line-clamp-1">
                              {getMetaSummary(record)}
                            </p>
                          )}
                          {/* Observações */}
                          {record.notes && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {record.notes}
                            </p>
                          )}
                          {!getMetaSummary(record) && !record.notes && (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>
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

