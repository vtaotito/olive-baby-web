import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { format, parseISO, startOfDay, endOfDay, addDays, subDays, isSameDay, getHours, getMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useToast } from '../../ui/Toast';
import { routineService } from '../../../services/api';
import { cn } from '../../../lib/utils';
import type { RoutineLog, RoutineType } from '../../../types';
import { RoutineRecordEditModal } from '../RoutineRecordEditModal';

interface DayTimelineProps {
  babyId: number;
  onRoutineUpdated?: () => void;
}

const ROUTINE_COLORS: Record<RoutineType, { bg: string; border: string; text: string; label: string }> = {
  SLEEP: { bg: 'bg-indigo-400', border: 'border-indigo-500', text: 'text-indigo-700', label: 'Sono' },
  FEEDING: { bg: 'bg-amber-400', border: 'border-amber-500', text: 'text-amber-700', label: 'Alimentação' },
  DIAPER: { bg: 'bg-emerald-400', border: 'border-emerald-500', text: 'text-emerald-700', label: 'Fralda' },
  BATH: { bg: 'bg-cyan-400', border: 'border-cyan-500', text: 'text-cyan-700', label: 'Banho' },
  MILK_EXTRACTION: { bg: 'bg-pink-400', border: 'border-pink-500', text: 'text-pink-700', label: 'Extração' },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getRoutinePosition(routine: RoutineLog, selectedDate: Date) {
  const start = parseISO(routine.startTime);
  const dayStart = startOfDay(selectedDate);
  const dayEnd = endOfDay(selectedDate);

  const effectiveStart = start < dayStart ? dayStart : start;
  const effectiveEnd = routine.endTime
    ? (parseISO(routine.endTime) > dayEnd ? dayEnd : parseISO(routine.endTime))
    : null;

  const startHour = getHours(effectiveStart) + getMinutes(effectiveStart) / 60;
  const leftPercent = (startHour / 24) * 100;

  if (effectiveEnd) {
    const endHour = getHours(effectiveEnd) + getMinutes(effectiveEnd) / 60;
    const widthPercent = Math.max(((endHour - startHour) / 24) * 100, 0.5);
    return { leftPercent, widthPercent, isInstant: false };
  }

  return { leftPercent, widthPercent: 0.6, isInstant: true };
}

function formatRoutineTime(routine: RoutineLog): string {
  const start = format(parseISO(routine.startTime), 'HH:mm');
  if (routine.endTime) {
    const end = format(parseISO(routine.endTime), 'HH:mm');
    return `${start} - ${end}`;
  }
  return start;
}

function formatDuration(seconds: number | undefined | null): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function getRoutineDetails(routine: RoutineLog): string {
  const meta = routine.meta as Record<string, unknown>;
  const parts: string[] = [];

  if (routine.routineType === 'FEEDING') {
    if (meta?.feedingType === 'breast') parts.push('Amamentação');
    else if (meta?.feedingType === 'bottle') parts.push(`Mamadeira${meta?.bottleMl ? ` ${meta.bottleMl}ml` : ''}`);
    else if (meta?.feedingType === 'solid') parts.push('Sólidos');
    if (meta?.complementMl) parts.push(`+${meta.complementMl}ml complemento`);
  }
  if (routine.routineType === 'DIAPER') {
    if (meta?.diaperType === 'pee' || meta?.wet) parts.push('Xixi');
    if (meta?.diaperType === 'poop' || meta?.dirty) parts.push('Cocô');
    if (meta?.diaperType === 'both') { parts.length = 0; parts.push('Xixi + Cocô'); }
  }
  if (routine.routineType === 'MILK_EXTRACTION') {
    if (meta?.extractionMl || meta?.quantityMl) parts.push(`${meta.extractionMl || meta.quantityMl}ml`);
  }
  if (routine.routineType === 'BATH') {
    if (meta?.bathTemperature || meta?.waterTemperature) parts.push(`${meta.bathTemperature || meta.waterTemperature}°C`);
  }
  if (routine.durationSeconds) parts.push(formatDuration(routine.durationSeconds));

  return parts.join(' · ');
}

type RoutineRow = { type: RoutineType; routines: RoutineLog[] };

function groupByType(routines: RoutineLog[]): RoutineRow[] {
  const typeOrder: RoutineType[] = ['SLEEP', 'FEEDING', 'DIAPER', 'BATH', 'MILK_EXTRACTION'];
  const groups: Partial<Record<RoutineType, RoutineLog[]>> = {};
  routines.forEach(r => {
    if (!groups[r.routineType]) groups[r.routineType] = [];
    groups[r.routineType]!.push(r);
  });
  return typeOrder
    .filter(t => groups[t] && groups[t]!.length > 0)
    .map(t => ({ type: t, routines: groups[t]! }));
}

export function DayTimeline({ babyId, onRoutineUpdated }: DayTimelineProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [routines, setRoutines] = useState<RoutineLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRoutine, setHoveredRoutine] = useState<RoutineLog | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<RoutineLog | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const fetchRoutines = useCallback(async () => {
    if (!babyId) return;
    setIsLoading(true);
    try {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      const response = await routineService.getHistory(babyId, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        limit: 100,
      });
      if (response.success) {
        setRoutines(response.data || []);
      }
    } catch (err) {
      console.error('[DayTimeline] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [babyId, selectedDate]);

  useEffect(() => { fetchRoutines(); }, [fetchRoutines]);

  const handleBarClick = (routine: RoutineLog) => {
    setEditingRoutine(prev => prev?.id === routine.id ? null : routine);
    setHoveredRoutine(null);
    setTooltipPos(null);
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleEditSave = async (data: Record<string, unknown>) => {
    if (!editingRoutine) return;
    setIsUpdating(true);
    try {
      await routineService.update(editingRoutine.id, data as any);
      toast.success('Rotina atualizada', 'O registro foi salvo com sucesso.');
      setEditingRoutine(null);
      await fetchRoutines();
      onRoutineUpdated?.();
    } catch (err: any) {
      console.error('[DayTimeline] Update error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Tente novamente.';
      toast.error('Erro ao atualizar rotina', msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const rows = useMemo(() => groupByType(routines), [routines]);
  const isTodayDate = isSameDay(selectedDate, new Date());

  const handleBarHover = (routine: RoutineLog, e: React.MouseEvent) => {
    if (editingRoutine) return;
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredRoutine(routine);
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleBarLeave = () => {
    setHoveredRoutine(null);
    setTooltipPos(null);
  };

  const nowIndicatorPercent = useMemo(() => {
    if (!isTodayDate) return null;
    const now = new Date();
    return ((getHours(now) + getMinutes(now) / 60) / 24) * 100;
  }, [isTodayDate]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Linha do Tempo</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedDate(d => subDays(d, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className={cn('text-sm font-medium px-3 py-1 rounded-lg transition-colors', isTodayDate ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100 text-gray-700')}
          >
            {isTodayDate ? 'Hoje' : format(selectedDate, "dd 'de' MMM", { locale: ptBR })}
          </button>
          <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" disabled={isTodayDate}>
            <ChevronRight className={cn('w-4 h-4', isTodayDate ? 'text-gray-200' : 'text-gray-500')} />
          </button>
        </div>
        <div className="text-xs text-gray-400">
          {routines.length} registro{routines.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-50 bg-gray-50/50 flex-wrap">
        {Object.entries(ROUTINE_COLORS).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1">
            <div className={cn('w-2.5 h-2.5 rounded-sm', config.bg)} />
            <span className="text-[10px] text-gray-500">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
          </div>
        ) : routines.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Nenhuma rotina registrada neste dia</div>
        ) : (
          <div ref={scrollRef} className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="flex border-b border-gray-100 px-2">
                {HOURS.map(h => (
                  <div key={h} className="flex-shrink-0 text-center text-[10px] text-gray-400 py-1" style={{ width: `${100 / 24}%` }}>
                    {h.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>

              <div className="relative px-2">
                <div className="absolute inset-0 flex pointer-events-none px-2">
                  {HOURS.map(h => (<div key={h} className="flex-shrink-0 border-l border-gray-50" style={{ width: `${100 / 24}%` }} />))}
                </div>

                {nowIndicatorPercent !== null && (
                  <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-20 pointer-events-none" style={{ left: `${nowIndicatorPercent}%` }}>
                    <div className="w-2 h-2 rounded-full bg-red-400 -ml-[3px] -mt-0.5" />
                  </div>
                )}

                {rows.map(({ type, routines: typeRoutines }) => {
                  const config = ROUTINE_COLORS[type];
                  return (
                    <div key={type} className="relative h-10 flex items-center">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                        <span className={cn('text-[9px] font-medium px-1 py-0.5 rounded', config.text, 'bg-white/80')}>{config.label}</span>
                      </div>
                      {typeRoutines.map(routine => {
                        const pos = getRoutinePosition(routine, selectedDate);
                        const isActive = editingRoutine?.id === routine.id;
                        return (
                          <button
                            key={routine.id}
                            className={cn(
                              'absolute h-6 rounded-md cursor-pointer transition-all hover:brightness-110 hover:shadow-md z-10',
                              config.bg,
                              pos.isInstant ? 'w-2.5 h-6 rounded-full' : '',
                              isActive ? 'ring-2 ring-offset-1 ring-olive-500 shadow-lg brightness-110' : '',
                              hoveredRoutine?.id === routine.id ? 'ring-2 ring-offset-1 ring-gray-400 shadow-lg' : ''
                            )}
                            style={{
                              left: `${pos.leftPercent}%`,
                              width: pos.isInstant ? '10px' : `${pos.widthPercent}%`,
                              minWidth: pos.isInstant ? '10px' : '4px',
                            }}
                            onMouseEnter={(e) => handleBarHover(routine, e)}
                            onMouseLeave={handleBarLeave}
                            onClick={() => handleBarClick(routine)}
                            title={`${config.label} · ${formatRoutineTime(routine)}`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tooltip */}
        {hoveredRoutine && tooltipPos && !editingRoutine && (
          <div
            className="absolute z-30 bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none max-w-[220px]"
            style={{
              left: Math.min(tooltipPos.x, (timelineRef.current?.clientWidth || 300) - 230),
              top: tooltipPos.y - 70,
            }}
          >
            <div className="font-semibold mb-0.5">{ROUTINE_COLORS[hoveredRoutine.routineType]?.label}</div>
            <div className="text-gray-300">{formatRoutineTime(hoveredRoutine)}</div>
            {getRoutineDetails(hoveredRoutine) && (<div className="text-gray-400 mt-0.5">{getRoutineDetails(hoveredRoutine)}</div>)}
            {hoveredRoutine.notes && (<div className="text-gray-400 mt-0.5 italic truncate">"{hoveredRoutine.notes}"</div>)}
            <div className="text-gray-500 mt-1 text-[10px]">Clique para editar</div>
          </div>
        )}
      </div>

      {/* Formulário inline de edição */}
      {editingRoutine && (
        <div ref={editFormRef} className="border-t border-olive-100 bg-olive-50/30 px-4 py-3">
          <RoutineRecordEditModal
            isOpen={true}
            onClose={() => setEditingRoutine(null)}
            routine={editingRoutine}
            routineType={editingRoutine.routineType}
            onSave={handleEditSave}
            isLoading={isUpdating}
          />
        </div>
      )}
    </div>
  );
}
