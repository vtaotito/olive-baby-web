// Olive Baby Web - Professional Agenda (Enhanced)
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, ChevronLeft, ChevronRight as ChevronRightIcon, CalendarDays, Clock,
  CheckCircle2, XCircle, UserCheck, AlertTriangle, MoreVertical, X,
  Stethoscope, Syringe, Phone, FileText, Baby, Timer, Eye,
} from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner, ConfirmModal, Input } from '../../components/ui';
import { appointmentService, professionalService } from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';

// ─── Config ─────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Stethoscope; bg: string; border: string; text: string; dot: string }> = {
  CONSULTA_ROTINA: { label: 'Rotina', icon: Stethoscope, bg: 'bg-olive-50 dark:bg-olive-900/20', border: 'border-olive-300 dark:border-olive-700', text: 'text-olive-700 dark:text-olive-300', dot: 'bg-olive-500' },
  RETORNO:         { label: 'Retorno', icon: FileText, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  URGENCIA:        { label: 'Urgência', icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  VACINA:          { label: 'Vacina', icon: Syringe, bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  TELEMEDICINA:    { label: 'Teleconsulta', icon: Phone, bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
  OUTRO:           { label: 'Outro', icon: CalendarDays, bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  SCHEDULED:   { label: 'Agendado', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: Clock },
  CONFIRMED:   { label: 'Confirmado', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: CheckCircle2 },
  CHECKED_IN:  { label: 'Chegou', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: UserCheck },
  IN_PROGRESS: { label: 'Em atendimento', bg: 'bg-olive-100 dark:bg-olive-900/30', text: 'text-olive-700 dark:text-olive-300', icon: Stethoscope },
  COMPLETED:   { label: 'Concluído', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', icon: CheckCircle2 },
  NO_SHOW:     { label: 'Não compareceu', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: XCircle },
  CANCELLED:   { label: 'Cancelado', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: XCircle },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.OUTRO;
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
}

// ─── Appointment Inline Form ─────────────────────────────────

const APPT_TYPES = [
  { value: 'CONSULTA_ROTINA', label: 'Consulta de rotina' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'VACINA', label: 'Vacina' },
  { value: 'URGENCIA', label: 'Urgência' },
  { value: 'TELEMEDICINA', label: 'Telemedicina' },
  { value: 'OUTRO', label: 'Outro' },
] as const;

const apptSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário é obrigatório'),
  babyId: z.number().min(1, 'Selecione o paciente'),
  type: z.enum(['CONSULTA_ROTINA', 'RETORNO', 'VACINA', 'URGENCIA', 'TELEMEDICINA', 'OUTRO']),
  durationMinutes: z.number().min(15).max(120).optional(),
  notes: z.string().optional(),
});

function AppointmentInlineForm({ defaultDate, onSuccess, onCancel }: { defaultDate?: Date; onSuccess: () => void; onCancel: () => void }) {
  const { success, error: showError } = useToast();
  const [patients, setPatients] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(apptSchema),
    defaultValues: {
      date: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      type: 'CONSULTA_ROTINA' as const,
      durationMinutes: 30,
      notes: '',
    },
  });

  useEffect(() => {
    professionalService.getMyPatients().then((r: any) => setPatients(r?.data || []));
  }, []);

  const inputCls = 'block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  const onSubmit = async (data: any) => {
    try {
      const startAt = new Date(`${data.date}T${data.startTime}:00`);
      await appointmentService.create({
        babyId: data.babyId,
        startAt: startAt.toISOString(),
        durationMinutes: data.durationMinutes || 30,
        type: data.type,
        notes: data.notes || undefined,
      });
      success('Agendamento criado', 'Consulta agendada com sucesso');
      onSuccess();
    } catch (err: any) {
      showError('Erro', err?.response?.data?.message || 'Falha ao agendar');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paciente</label>
        <select {...register('babyId', { valueAsNumber: true })} className={inputCls}>
          <option value={0}>Selecione...</option>
          {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {errors.babyId && <p className="text-sm text-red-600 mt-1">{(errors.babyId as any).message}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input label="Data" type="date" {...register('date')} error={errors.date?.message as string} />
        <Input label="Horário" type="time" {...register('startTime')} error={errors.startTime?.message as string} />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
          <select {...register('type')} className={inputCls}>
            {APPT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <Input label="Duração (min)" type="number" min={15} max={120} step={15} {...register('durationMinutes', { valueAsNumber: true })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
        <textarea {...register('notes')} rows={2} className={inputCls} placeholder="Observações opcionais..." />
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={isSubmitting}>Agendar</Button>
      </div>
    </form>
  );
}

// ─── Component ──────────────────────────────────────────────

export function ProfAgendaPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentFormDate, setAppointmentFormDate] = useState<Date | undefined>();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const end = endOfWeek(weekStart, { weekStartsOn: 1 });
      const aptRes = await appointmentService.list({
        startDate: weekStart.toISOString(),
        endDate: end.toISOString(),
      });
      setAppointments(aptRes?.data || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const appointmentsByDay = useMemo(() => {
    return weekDays.reduce((acc, day) => {
      const key = format(day, 'yyyy-MM-dd');
      acc[key] = appointments
        .filter((a) => isSameDay(new Date(a.startAt), day))
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      return acc;
    }, {} as Record<string, any[]>);
  }, [weekDays, appointments]);

  const selectedDayKey = format(selectedDay, 'yyyy-MM-dd');
  const selectedDayAppointments = appointmentsByDay[selectedDayKey] || [];
  const activeAppointments = selectedDayAppointments.filter(a => !['CANCELLED', 'NO_SHOW'].includes(a.status));
  const cancelledAppointments = selectedDayAppointments.filter(a => ['CANCELLED', 'NO_SHOW'].includes(a.status));

  // Counts for summary
  const todayCounts = useMemo(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const todayApts = appointments.filter(a => isSameDay(new Date(a.startAt), new Date()));
    return {
      total: todayApts.filter(a => !['CANCELLED'].includes(a.status)).length,
      confirmed: todayApts.filter(a => a.status === 'CONFIRMED').length,
      completed: todayApts.filter(a => a.status === 'COMPLETED').length,
      pending: todayApts.filter(a => a.status === 'SCHEDULED').length,
    };
  }, [appointments]);

  const weekLabel = `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}`;
  const totalWeekActive = appointments.filter(a => !['CANCELLED'].includes(a.status)).length;

  // ─── Actions ──────────────────────────────────────────────

  const handleStatusChange = async (apt: any, newStatus: string) => {
    setActionLoading(apt.id);
    try {
      await appointmentService.updateStatus(apt.id, newStatus);
      success('Status atualizado', `Consulta marcada como "${getStatusConfig(newStatus).label}"`);
      load();
    } catch {
      showError('Erro', 'Não foi possível atualizar o status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(cancelTarget.id);
    try {
      await appointmentService.cancel(cancelTarget.id);
      success('Cancelado', 'Consulta cancelada com sucesso');
      setCancelModalOpen(false);
      setCancelTarget(null);
      load();
    } catch {
      showError('Erro', 'Não foi possível cancelar');
    } finally {
      setActionLoading(null);
    }
  };

  const getNextActions = (apt: any) => {
    const actions: { label: string; status: string; variant: string; icon: typeof Clock }[] = [];
    switch (apt.status) {
      case 'SCHEDULED':
        actions.push({ label: 'Confirmar', status: 'CONFIRMED', variant: 'green', icon: CheckCircle2 });
        break;
      case 'CONFIRMED':
        actions.push({ label: 'Check-in', status: 'CHECKED_IN', variant: 'amber', icon: UserCheck });
        break;
      case 'CHECKED_IN':
        actions.push({ label: 'Iniciar', status: 'IN_PROGRESS', variant: 'olive', icon: Stethoscope });
        break;
      case 'IN_PROGRESS':
        actions.push({ label: 'Concluir', status: 'COMPLETED', variant: 'gray', icon: CheckCircle2 });
        break;
    }
    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gerencie suas consultas e atendimentos
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setAppointmentFormDate(undefined);
            setShowAppointmentForm(true);
          }}
        >
          Nova consulta
        </Button>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayCounts.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Consultas hoje</p>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{todayCounts.confirmed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Confirmadas</p>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{todayCounts.pending}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pendentes</p>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-4 text-center">
            <p className="text-3xl font-bold text-olive-600 dark:text-olive-400">{todayCounts.completed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Concluídas</p>
          </CardBody>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardBody className="flex items-center justify-between py-3 px-4">
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))} leftIcon={<ChevronLeft className="w-4 h-4" />}>
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-olive-600 dark:text-olive-400" />
            <span className="font-semibold text-gray-900 dark:text-white capitalize">{weekLabel}</span>
            <span className="text-sm text-gray-400">({totalWeekActive} consultas)</span>
            {!weekDays.some(d => isToday(d)) && (
              <Button variant="outline" size="sm" onClick={() => { setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 })); setSelectedDay(new Date()); }}>
                Hoje
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))} rightIcon={<ChevronRightIcon className="w-4 h-4" />}>
            <span className="hidden sm:inline">Próxima</span>
          </Button>
        </CardBody>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" />
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Carregando agenda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Mini Week Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardBody className="p-3">
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">{d}</div>
                  ))}
                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const dayApts = (appointmentsByDay[key] || []).filter(a => !['CANCELLED'].includes(a.status));
                    const today = isToday(day);
                    const isSelected = isSameDay(day, selectedDay);

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          'relative rounded-xl p-2 text-center transition-all min-h-[72px] flex flex-col items-center justify-start gap-1',
                          isSelected
                            ? 'bg-olive-100 dark:bg-olive-900/40 ring-2 ring-olive-500'
                            : today
                              ? 'bg-olive-50/50 dark:bg-olive-900/10'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                        )}
                      >
                        <span className={cn(
                          'text-xs font-medium',
                          today ? 'text-olive-600 dark:text-olive-400' : 'text-gray-400 dark:text-gray-500'
                        )}>
                          {format(day, 'd')}
                        </span>
                        <span className={cn(
                          'text-lg font-bold leading-none',
                          isSelected ? 'text-olive-700 dark:text-olive-200' : today ? 'text-olive-600 dark:text-olive-300' : 'text-gray-800 dark:text-white'
                        )}>
                          {dayApts.length}
                        </span>
                        {/* Dots for appointment types */}
                        {dayApts.length > 0 && (
                          <div className="flex gap-0.5 flex-wrap justify-center">
                            {dayApts.slice(0, 4).map((apt, i) => (
                              <div key={i} className={cn('w-1.5 h-1.5 rounded-full', getTypeConfig(apt.type).dot)} />
                            ))}
                            {dayApts.length > 4 && <span className="text-[8px] text-gray-400">+{dayApts.length - 4}</span>}
                          </div>
                        )}
                        {today && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-olive-500" />}
                      </button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Type Legend */}
            <Card className="mt-3">
              <CardBody className="p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Tipos de consulta</p>
                <div className="space-y-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <div key={key} className="flex items-center gap-2.5 text-sm">
                        <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                        <Icon className={cn('w-3.5 h-3.5', cfg.text)} />
                        <span className="text-gray-600 dark:text-gray-400">{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right: Day Detail */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeAppointments.length} consulta{activeAppointments.length !== 1 ? 's' : ''} ativas
                  {cancelledAppointments.length > 0 && ` · ${cancelledAppointments.length} cancelada${cancelledAppointments.length > 1 ? 's' : ''}`}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => { setAppointmentFormDate(selectedDay); setShowAppointmentForm(true); }}
              >
                Agendar
              </Button>
            </div>

            {activeAppointments.length === 0 ? (
              <Card>
                <CardBody className="flex flex-col items-center py-12">
                  <CalendarDays className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhuma consulta neste dia</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Clique em "Agendar" para adicionar</p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeAppointments.map((apt) => {
                  const typeConfig = getTypeConfig(apt.type);
                  const statusCfg = getStatusConfig(apt.status);
                  const StatusIcon = statusCfg.icon;
                  const TypeIcon = typeConfig.icon;
                  const isExpanded = selectedAppointment?.id === apt.id;
                  const actions = getNextActions(apt);
                  const isLoadingThis = actionLoading === apt.id;

                  return (
                    <Card
                      key={apt.id}
                      className={cn(
                        'transition-all overflow-hidden',
                        isExpanded && 'ring-2 ring-olive-300 dark:ring-olive-700',
                        apt.status === 'COMPLETED' && 'opacity-70'
                      )}
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => setSelectedAppointment(isExpanded ? null : apt)}
                      >
                        <CardBody className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Time */}
                            <div className="text-center flex-shrink-0 w-14">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {format(new Date(apt.startAt), 'HH:mm')}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                {apt.durationMinutes || 30} min
                              </p>
                            </div>

                            {/* Color bar */}
                            <div className={cn('w-1 self-stretch rounded-full flex-shrink-0', typeConfig.dot)} />

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Baby className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  {apt.baby?.name || 'Paciente'}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', typeConfig.bg, typeConfig.text)}>
                                  <TypeIcon className="w-3 h-3" />
                                  {typeConfig.label}
                                </span>
                                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.bg, statusCfg.text)}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusCfg.label}
                                </span>
                              </div>
                            </div>

                            {/* Chevron */}
                            <ChevronRightIcon className={cn('w-5 h-5 text-gray-400 transition-transform flex-shrink-0', isExpanded && 'rotate-90')} />
                          </div>
                        </CardBody>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 space-y-4">
                          {/* Notes */}
                          {apt.notes && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Observações</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{apt.notes}</p>
                            </div>
                          )}

                          {/* Info */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-400">Horário</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                {format(new Date(apt.startAt), 'HH:mm')} - {format(new Date(apt.endAt || new Date(new Date(apt.startAt).getTime() + (apt.durationMinutes || 30) * 60000)), 'HH:mm')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Duração</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{apt.durationMinutes || 30} minutos</p>
                            </div>
                            {apt.confirmedAt && (
                              <div>
                                <p className="text-xs text-gray-400">Confirmado em</p>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{format(new Date(apt.confirmedAt), 'dd/MM/yyyy HH:mm')}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            {actions.map((action) => {
                              const ActionIcon = action.icon;
                              return (
                                <Button
                                  key={action.status}
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(apt, action.status); }}
                                  isLoading={isLoadingThis}
                                  leftIcon={<ActionIcon className="w-4 h-4" />}
                                >
                                  {action.label}
                                </Button>
                              );
                            })}

                            {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                              <>
                                {apt.status !== 'NO_SHOW' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(apt, 'NO_SHOW'); }}
                                    isLoading={isLoadingThis}
                                    leftIcon={<XCircle className="w-4 h-4" />}
                                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                  >
                                    Não compareceu
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => { e.stopPropagation(); setCancelTarget(apt); setCancelModalOpen(true); }}
                                  leftIcon={<X className="w-4 h-4" />}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}

                            {/* View patient */}
                            {apt.baby?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); navigate(`/prof/patients/${apt.baby.id}`); }}
                                leftIcon={<Eye className="w-4 h-4" />}
                              >
                                Ver prontuário
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Cancelled/No-show section */}
            {cancelledAppointments.length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">Canceladas / Não compareceram</p>
                <div className="space-y-2">
                  {cancelledAppointments.map((apt) => {
                    const statusCfg = getStatusConfig(apt.status);
                    return (
                      <div key={apt.id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 opacity-60">
                        <span className="text-sm font-medium text-gray-400 w-12 text-center">{format(new Date(apt.startAt), 'HH:mm')}</span>
                        <span className="text-sm text-gray-500 line-through flex-1">{apt.baby?.name || 'Paciente'}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', statusCfg.bg, statusCfg.text)}>{statusCfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inline Appointment Form */}
      {showAppointmentForm && (
        <Card className="border-olive-200 dark:border-olive-800 ring-1 ring-olive-100 dark:ring-olive-900">
          <CardHeader
            title="Novo agendamento"
            action={<Button size="sm" variant="ghost" onClick={() => setShowAppointmentForm(false)}><span className="text-gray-500">Fechar</span></Button>}
          />
          <CardBody>
            <AppointmentInlineForm
              defaultDate={appointmentFormDate}
              onSuccess={() => { setShowAppointmentForm(false); load(); }}
              onCancel={() => setShowAppointmentForm(false)}
            />
          </CardBody>
        </Card>
      )}

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => { setCancelModalOpen(false); setCancelTarget(null); }}
        onConfirm={handleCancel}
        title="Cancelar consulta"
        message={`Tem certeza que deseja cancelar a consulta de ${cancelTarget?.baby?.name || 'este paciente'} às ${cancelTarget ? format(new Date(cancelTarget.startAt), 'HH:mm') : ''}?`}
        confirmText="Cancelar consulta"
        variant="danger"
      />
    </div>
  );
}
