import { useState, useEffect, useCallback, useRef } from 'react';
import { format, parseISO, isToday, isYesterday, startOfDay, subDays, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Moon, Utensils, Droplets, Bath, Baby, ChevronRight, Clock, Droplet, Wind, Pencil } from 'lucide-react';
import { Card, CardBody, Spinner } from '../../ui';
import { routineService } from '../../../services/api';
import { cn } from '../../../lib/utils';
import type { RoutineLog } from '../../../types';
import { RoutineRecordEditModal } from '../RoutineRecordEditModal';

interface RoutinesListProps {
  babyId: number;
}

const routineConfig = {
  FEEDING: { icon: Utensils, label: 'Alimentação', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  SLEEP: { icon: Moon, label: 'Sono', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  BATH: { icon: Bath, label: 'Banho', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  DIAPER: { icon: Baby, label: 'Fralda', color: 'text-green-600', bgColor: 'bg-green-100' },
  MILK_EXTRACTION: { icon: Droplets, label: 'Extração', color: 'text-pink-600', bgColor: 'bg-pink-100' },
};

type FilterType = 'all' | 'FEEDING' | 'SLEEP' | 'DIAPER' | 'BATH' | 'MILK_EXTRACTION';
type DateFilter = 'today' | '7days' | '30days';

function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: ptBR });
}

function formatDuration(seconds: number | undefined | null): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function formatDateHeader(date: Date): string {
  if (isToday(date)) return 'Hoje';
  if (isYesterday(date)) return 'Ontem';
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

function formatTimeElapsed(startTime: string | Date, endTime: Date): string {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const totalMinutes = differenceInMinutes(endTime, start);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return `00:${minutes.toString().padStart(2, '0')}`;
}

interface RoutineItemProps {
  routine: RoutineLog;
  refreshTimestamp?: Date;
  isEditing: boolean;
  onEdit: (routine: RoutineLog) => void;
  onSave: (data: Record<string, unknown>) => void;
  onCancelEdit: () => void;
  isUpdating: boolean;
  editRef?: React.RefObject<HTMLDivElement>;
}

function RoutineItem({ routine, refreshTimestamp, isEditing, onEdit, onSave, onCancelEdit, isUpdating, editRef }: RoutineItemProps) {
  const config = routineConfig[routine.routineType as keyof typeof routineConfig];
  if (!config) return null;

  const Icon = config.icon;
  const meta = routine.meta as Record<string, unknown>;
  const details: string[] = [];

  let timeSinceLastFeeding: string | null = null;
  if (routine.routineType === 'FEEDING' && refreshTimestamp && routine.endTime) {
    timeSinceLastFeeding = formatTimeElapsed(routine.endTime, refreshTimestamp);
  }

  if (routine.routineType === 'FEEDING') {
    if (meta?.feedingType === 'breast') {
      details.push('Amamentação');
      if (meta?.breastSide) {
        const sides: Record<string, string> = { left: 'Esquerdo', right: 'Direito', both: 'Ambos' };
        details.push(`Lado ${sides[meta.breastSide as string] || meta.breastSide}`);
      }
    } else if (meta?.feedingType === 'bottle') {
      details.push('Mamadeira');
      if (meta?.bottleMl) details.push(`${meta.bottleMl}ml`);
    } else if (meta?.feedingType === 'solid') {
      details.push('Sólidos');
    }
    if (meta?.complementMl) details.push(`Complemento: ${meta.complementMl}ml`);
  }
  if (routine.routineType === 'SLEEP') {
    if (meta?.quality) details.push(`Qualidade: ${meta.quality}`);
    if (meta?.location) details.push(`Local: ${meta.location}`);
  }

  let diaperIcon: React.ReactElement | null = null;
  if (routine.routineType === 'DIAPER') {
    const isWet = meta?.wet === true;
    const isDirty = meta?.dirty === true;
    if (isWet && isDirty) {
      diaperIcon = (<div className="flex items-center gap-1"><Droplet className="w-4 h-4 text-blue-500" /><Wind className="w-4 h-4 text-amber-600" /></div>);
      details.push('Xixi + Cocô');
    } else if (isWet) {
      diaperIcon = <Droplet className="w-4 h-4 text-blue-500" />;
      details.push('Xixi');
    } else if (isDirty) {
      diaperIcon = <Wind className="w-4 h-4 text-amber-600" />;
      details.push('Cocô');
    }
    if (meta?.consistency) details.push(`Consistência: ${meta.consistency}`);
  }
  if (routine.routineType === 'MILK_EXTRACTION') {
    if (meta?.ml) details.push(`${meta.ml}ml`);
    if (meta?.side) {
      const sides: Record<string, string> = { left: 'Esquerdo', right: 'Direito', both: 'Ambos' };
      details.push(`Lado ${sides[meta.side as string] || meta.side}`);
    }
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-colors',
          isEditing ? 'bg-olive-50 ring-1 ring-olive-200' : 'hover:bg-gray-50'
        )}
      >
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center relative', config.bgColor)}>
          <Icon className={cn('w-5 h-5', config.color)} />
          {routine.routineType === 'DIAPER' && diaperIcon && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">{diaperIcon}</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{config.label}</span>
            {routine.updatedAt && routine.updatedAt !== routine.createdAt && (
              <span className="text-[10px] px-1.5 py-0 rounded bg-gray-100 text-gray-400">editado</span>
            )}
            {routine.durationSeconds && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />{formatDuration(routine.durationSeconds)}
              </span>
            )}
            {routine.routineType === 'FEEDING' && timeSinceLastFeeding && (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" />{timeSinceLastFeeding} atrás
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{formatTime(routine.startTime)}</span>
            {routine.endTime && (<><span>→</span><span>{formatTime(routine.endTime)}</span></>)}
            {!routine.endTime && (<span className="text-green-600 font-medium">• Em andamento</span>)}
          </div>

          {details.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{details.join(' • ')}</p>
          )}
          {routine.notes && (
            <p className="text-xs text-gray-400 mt-0.5 truncate italic">"{routine.notes}"</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(routine); }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isEditing ? 'bg-olive-200 text-olive-700' : 'hover:bg-gray-100 text-gray-400'
            )}
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>

      {/* Formulário inline de edição */}
      {isEditing && (
        <div ref={editRef as React.RefObject<HTMLDivElement>} className="px-3 pb-3">
          <RoutineRecordEditModal
            isOpen={true}
            onClose={onCancelEdit}
            routine={routine}
            routineType={routine.routineType}
            onSave={onSave}
            isLoading={isUpdating}
          />
        </div>
      )}
    </div>
  );
}

export function RoutinesList({ babyId }: RoutinesListProps) {
  const [routines, setRoutines] = useState<RoutineLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [refreshTimestamp, setRefreshTimestamp] = useState<Date>(new Date());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const editFormRef = useRef<HTMLDivElement>(null);

  const fetchRoutines = useCallback(async () => {
    if (!babyId) return;
    setIsLoading(true);
    try {
      const days = dateFilter === 'today' ? 0 : dateFilter === '7days' ? 7 : 30;
      const startDate = startOfDay(subDays(new Date(), days));
      const response = await routineService.getHistory(babyId, {
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        type: typeFilter === 'all' ? undefined : typeFilter,
        limit: 50,
      });
      if (response.success) {
        setRoutines(response.data || []);
        setRefreshTimestamp(new Date());
      }
    } catch (err) {
      console.error('[RoutinesList] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [babyId, typeFilter, dateFilter]);

  useEffect(() => { fetchRoutines(); }, [fetchRoutines]);

  const handleEdit = (routine: RoutineLog) => {
    setEditingId(prev => prev === routine.id ? null : routine.id);
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleEditSave = async (data: Record<string, unknown>) => {
    if (!editingId) return;
    setIsUpdating(true);
    try {
      await routineService.update(editingId, data as any);
      setEditingId(null);
      fetchRoutines();
    } catch (err) {
      console.error('[RoutinesList] Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const groupedRoutines = routines.reduce((groups, routine) => {
    const date = format(parseISO(routine.startTime), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(routine);
    return groups;
  }, {} as Record<string, RoutineLog[]>);

  const sortedDates = Object.keys(groupedRoutines).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Histórico de Rotinas
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg bg-gray-100 p-1">
            {[
              { value: 'today', label: 'Hoje' },
              { value: '7days', label: '7 dias' },
              { value: '30days', label: '30 dias' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateFilter(opt.value as DateFilter)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  dateFilter === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FilterType)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
          >
            <option value="all">Todos os tipos</option>
            <option value="FEEDING">🍼 Alimentação</option>
            <option value="SLEEP">😴 Sono</option>
            <option value="DIAPER">🚼 Fralda</option>
            <option value="BATH">🛁 Banho</option>
            <option value="MILK_EXTRACTION">💧 Extração</option>
          </select>
        </div>
      </div>

      <Card>
        <CardBody className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Spinner size="lg" /></div>
          ) : routines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {typeFilter === 'all'
                  ? 'Nenhuma rotina registrada neste período'
                  : `Nenhum registro de ${routineConfig[typeFilter as keyof typeof routineConfig]?.label.toLowerCase() || typeFilter} encontrado`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedDates.map((date) => (
                <div key={date}>
                  <div className="px-3 py-2 bg-gray-50 sticky top-0">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {formatDateHeader(parseISO(date))}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {groupedRoutines[date]
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((routine) => (
                        <RoutineItem
                          key={routine.id}
                          routine={routine}
                          refreshTimestamp={refreshTimestamp}
                          isEditing={editingId === routine.id}
                          onEdit={handleEdit}
                          onSave={handleEditSave}
                          onCancelEdit={() => setEditingId(null)}
                          isUpdating={isUpdating}
                          editRef={editingId === routine.id ? editFormRef : undefined}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
