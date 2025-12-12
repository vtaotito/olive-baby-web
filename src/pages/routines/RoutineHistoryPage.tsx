// Olive Baby Web - Routine History Page
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, endOfDay, subDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useBabyStore } from '@/stores/babyStore';
import { routineService } from '@/services/api';
import { RoutineLog, RoutineType } from '@/types';
import { cn } from '@/lib/utils';

// Tipos de rotina com labels e cores
const ROUTINE_TYPES: Record<RoutineType, { label: string; color: string; icon: string }> = {
  FEEDING: { label: 'Alimentação', color: 'bg-blue-100 text-blue-800', icon: '🍼' },
  SLEEP: { label: 'Sono', color: 'bg-purple-100 text-purple-800', icon: '😴' },
  DIAPER: { label: 'Fralda', color: 'bg-yellow-100 text-yellow-800', icon: '👶' },
  BATH: { label: 'Banho', color: 'bg-cyan-100 text-cyan-800', icon: '🛁' },
  MILK_EXTRACTION: { label: 'Extração', color: 'bg-pink-100 text-pink-800', icon: '💧' },
};

// Filtros de data rápidos
const DATE_FILTERS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: 'Últimos 7 dias', value: '7days' },
  { label: 'Últimos 30 dias', value: '30days' },
  { label: 'Este mês', value: 'month' },
  { label: 'Tudo', value: 'all' },
];

export function RoutineHistoryPage() {
  const { selectedBaby, babies } = useBabyStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [selectedBabyId, setSelectedBabyId] = useState<number | null>(
    selectedBaby?.id || babies[0]?.id || null
  );
  const [routineType, setRoutineType] = useState<RoutineType | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineLog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const limit = 20;

  // Calcular datas baseado no filtro
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined;

    switch (dateFilter) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        start = startOfDay(yesterday);
        end = endOfDay(yesterday);
        break;
      case '7days':
        start = startOfDay(subDays(now, 7));
        end = endOfDay(now);
        break;
      case '30days':
        start = startOfDay(subDays(now, 30));
        end = endOfDay(now);
        break;
      case 'month':
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        end = endOfDay(now);
        break;
      case 'all':
        start = undefined;
        end = undefined;
        break;
      case 'custom':
        start = customStartDate ? startOfDay(parseISO(customStartDate)) : undefined;
        end = customEndDate ? endOfDay(parseISO(customEndDate)) : undefined;
        break;
    }

    return { start, end };
  }, [dateFilter, customStartDate, customEndDate]);

  // Buscar rotinas
  const { data: routinesData, isLoading, error } = useQuery({
    queryKey: ['routines', selectedBabyId, routineType, dateRange.start, dateRange.end, page, limit],
    queryFn: async () => {
      if (!selectedBabyId) return { data: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } };
      
      const response = await routineService.list(selectedBabyId, {
        type: routineType !== 'ALL' ? routineType : undefined,
        startDate: dateRange.start?.toISOString(),
        endDate: dateRange.end?.toISOString(),
        page,
        limit,
      });
      return response.data;
    },
    enabled: !!selectedBabyId,
  });

  const routines = routinesData?.data || [];
  const pagination = routinesData?.pagination || { total: 0, page: 1, limit, totalPages: 0 };

  // Filtrar por busca (client-side)
  const filteredRoutines = useMemo(() => {
    if (!searchQuery.trim()) return routines;
    
    const query = searchQuery.toLowerCase();
    return routines.filter((routine: RoutineLog) => {
      const notes = routine.notes?.toLowerCase() || '';
      const type = ROUTINE_TYPES[routine.routineType].label.toLowerCase();
      return notes.includes(query) || type.includes(query);
    });
  }, [routines, searchQuery]);

  // Agrupar por data para visualização
  const groupedByDate = useMemo(() => {
    const groups: Record<string, RoutineLog[]> = {};
    
    filteredRoutines.forEach((routine: RoutineLog) => {
      const dateKey = format(parseISO(routine.startTime), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(routine);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredRoutines]);

  // Mutação para deletar
  const deleteMutation = useMutation({
    mutationFn: (routineId: number) => routineService.delete(routineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Rotina deletada com sucesso');
      setShowDeleteModal(false);
      setSelectedRoutine(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao deletar rotina');
    },
  });

  // Estatísticas rápidas
  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRoutines = filteredRoutines.filter((r: RoutineLog) =>
      format(parseISO(r.startTime), 'yyyy-MM-dd') === today
    );

    return {
      total: filteredRoutines.length,
      today: todayRoutines.length,
      byType: Object.keys(ROUTINE_TYPES).reduce((acc, type) => {
        acc[type] = filteredRoutines.filter((r: RoutineLog) => r.routineType === type).length;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [filteredRoutines]);

  // Handlers
  const handleDelete = () => {
    if (selectedRoutine) {
      deleteMutation.mutate(selectedRoutine.id);
    }
  };

  const handleEdit = (routine: RoutineLog) => {
    setSelectedRoutine(routine);
    setShowEditModal(true);
  };

  const handleView = (routine: RoutineLog) => {
    setSelectedRoutine(routine);
    // Abrir modal de visualização
  };

  if (!selectedBabyId && babies.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum bebê cadastrado</p>
            <Button onClick={() => window.location.href = '/settings/babies'}>
              Cadastrar Bebê
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Histórico de Rotinas</h1>
              <p className="text-gray-500 mt-1">Visualize e gerencie todas as rotinas registradas</p>
            </div>
            <Button
              onClick={() => window.location.href = '/routines/feeding'}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Rotina
            </Button>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-sm text-gray-500">Hoje</div>
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            </div>
            {Object.entries(ROUTINE_TYPES).map(([type, { label, icon }]) => (
              <div key={type} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <span>{icon}</span> {label}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.byType[type] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Seleção de Bebê */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bebê</label>
              <Select
                value={selectedBabyId?.toString() || ''}
                onChange={(e) => setSelectedBabyId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Todos</option>
                {babies.map((baby) => (
                  <option key={baby.id} value={baby.id}>
                    {baby.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Tipo de Rotina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <Select
                value={routineType}
                onChange={(e) => {
                  setRoutineType(e.target.value as RoutineType | 'ALL');
                  setPage(1);
                }}
              >
                <option value="ALL">Todos</option>
                {Object.entries(ROUTINE_TYPES).map(([type, { label }]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Filtro de Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <Select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
              >
                {DATE_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
                <option value="custom">Personalizado</option>
              </Select>
            </div>

            {/* Datas Personalizadas */}
            {dateFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Busca */}
            <div className={cn(dateFilter === 'custom' ? 'col-span-2' : '')}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por notas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Carregando rotinas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Erro ao carregar rotinas</p>
          </div>
        ) : filteredRoutines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <p className="text-gray-500 mb-4">Nenhuma rotina encontrada</p>
            <Button onClick={() => window.location.href = '/routines/feeding'}>
              Registrar Primeira Rotina
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de Rotinas */}
            <div className="space-y-4">
              {groupedByDate.map(([date, dateRoutines]) => (
                <div key={date} className="bg-white rounded-lg shadow-sm border">
                  {/* Cabeçalho da Data */}
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">
                          {format(parseISO(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </h3>
                        <Badge variant="secondary">{dateRoutines.length}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Rotinas do Dia */}
                  <div className="divide-y">
                    {dateRoutines.map((routine: RoutineLog) => {
                      const routineInfo = ROUTINE_TYPES[routine.routineType];
                      const startTime = format(parseISO(routine.startTime), 'HH:mm');
                      const endTime = routine.endTime
                        ? format(parseISO(routine.endTime), 'HH:mm')
                        : null;
                      const duration = routine.durationSeconds
                        ? Math.floor(routine.durationSeconds / 60)
                        : null;

                      return (
                        <div
                          key={routine.id}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Ícone e Tipo */}
                              <div className="flex-shrink-0">
                                <div className={cn(
                                  'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                                  routineInfo.color
                                )}>
                                  {routineInfo.icon}
                                </div>
                              </div>

                              {/* Informações */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {routineInfo.label}
                                  </h4>
                                  <Badge className={routineInfo.color}>
                                    {routineInfo.label}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {startTime}
                                    {endTime && ` - ${endTime}`}
                                  </div>
                                  {duration && (
                                    <span>Duração: {duration} min</span>
                                  )}
                                </div>

                                {routine.notes && (
                                  <p className="text-sm text-gray-600 mt-2">{routine.notes}</p>
                                )}

                                {/* Meta informações específicas */}
                                {routine.routineType === 'FEEDING' && routine.meta && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    {routine.meta.feedingType === 'breast' && '🍼 Amamentação'}
                                    {routine.meta.feedingType === 'bottle' && `🍼 Mamadeira: ${routine.meta.bottleMl || 0}ml`}
                                    {routine.meta.feedingType === 'solid' && '🥄 Alimento sólido'}
                                  </div>
                                )}

                                {routine.routineType === 'DIAPER' && routine.meta && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    {routine.meta.diaperType === 'pee' && '💧 Xixi'}
                                    {routine.meta.diaperType === 'poop' && '💩 Cocô'}
                                    {routine.meta.diaperType === 'both' && '💧💩 Xixi e Cocô'}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(routine)}
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(routine)}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRoutine(routine);
                                  setShowDeleteModal(true);
                                }}
                                title="Deletar"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
                <div className="text-sm text-gray-500">
                  Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, pagination.total)} de {pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-500">
                    Página {page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de Deletar */}
        {showDeleteModal && selectedRoutine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja deletar esta rotina? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRoutine(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição (placeholder - pode ser expandido) */}
        {showEditModal && selectedRoutine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Editar Rotina</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRoutine(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-500 mb-4">
                Funcionalidade de edição em desenvolvimento...
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRoutine(null);
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
