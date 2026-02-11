// Olive Baby Web - Professional Agenda
import { useEffect, useState, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight as ChevronRightIcon, CalendarDays, Clock } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner } from '../../components/ui';
import { AppointmentFormModal } from '../../components/prof';
import { appointmentService } from '../../services/api';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

const TYPE_COLORS: Record<string, string> = {
  ROUTINE: 'bg-olive-100 border-olive-300 text-olive-800 dark:bg-olive-900/30 dark:border-olive-700 dark:text-olive-300',
  FOLLOW_UP: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
  EMERGENCY: 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  VACCINATION: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300',
  DEFAULT: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300',
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || TYPE_COLORS.DEFAULT;
}

export function ProfAgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

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

  useEffect(() => {
    load();
  }, [load]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const appointmentsByDay = weekDays.reduce((acc, day) => {
    const key = format(day, 'yyyy-MM-dd');
    acc[key] = appointments
      .filter(
        (a) => isSameDay(new Date(a.startAt), day) && !['CANCELLED', 'NO_SHOW'].includes(a.status)
      )
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    return acc;
  }, {} as Record<string, any[]>);

  const weekLabel = `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}`;
  const totalWeekAppointments = Object.values(appointmentsByDay).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {totalWeekAppointments} consulta{totalWeekAppointments !== 1 ? 's' : ''} nesta semana
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedDate(undefined);
            setAppointmentModalOpen(true);
          }}
        >
          Nova consulta
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardBody className="flex items-center justify-between py-3 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-olive-600 dark:text-olive-400" />
            <span className="font-semibold text-gray-900 dark:text-white capitalize">{weekLabel}</span>
            {!weekDays.some(isToday) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              >
                Hoje
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            rightIcon={<ChevronRightIcon className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Próxima</span>
          </Button>
        </CardBody>
      </Card>

      {/* Weekly Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" />
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Carregando agenda...</p>
        </div>
      ) : (
        <>
          {/* Desktop: Grid 7 colunas */}
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayAppointments = appointmentsByDay[key] || [];
              const today = isToday(day);

              return (
                <div
                  key={key}
                  className={cn(
                    'rounded-xl border transition-all min-h-[280px] flex flex-col',
                    today
                      ? 'border-olive-300 dark:border-olive-700 bg-olive-50/50 dark:bg-olive-900/10 ring-1 ring-olive-200 dark:ring-olive-800'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  )}
                >
                  {/* Day Header */}
                  <div className={cn(
                    'px-3 py-2.5 border-b text-center',
                    today ? 'border-olive-200 dark:border-olive-800' : 'border-gray-100 dark:border-gray-700'
                  )}>
                    <p className={cn(
                      'text-xs font-medium uppercase tracking-wider',
                      today ? 'text-olive-600 dark:text-olive-400' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {format(day, 'EEE', { locale: ptBR })}
                    </p>
                    <p className={cn(
                      'text-lg font-bold mt-0.5',
                      today ? 'text-olive-700 dark:text-olive-300' : 'text-gray-900 dark:text-white'
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>

                  {/* Appointments */}
                  <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                    {dayAppointments.length === 0 ? (
                      <button
                        onClick={() => { setSelectedDate(day); setAppointmentModalOpen(true); }}
                        className="w-full h-full min-h-[60px] flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-olive-500 dark:hover:text-olive-400 hover:bg-olive-50 dark:hover:bg-olive-900/10 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      dayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={cn(
                            'p-2 rounded-lg border-l-3 text-xs cursor-pointer hover:shadow-sm transition-shadow',
                            getTypeColor(apt.type)
                          )}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="font-semibold">{format(new Date(apt.startAt), 'HH:mm')}</span>
                          </div>
                          <p className="font-medium truncate">{apt.baby?.name || 'Paciente'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: Lista por dia */}
          <div className="md:hidden space-y-4">
            {weekDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayAppointments = appointmentsByDay[key] || [];
              const today = isToday(day);

              return (
                <Card
                  key={key}
                  className={cn(
                    today && 'border-olive-300 dark:border-olive-700 ring-1 ring-olive-200 dark:ring-olive-800'
                  )}
                >
                  <CardHeader
                    title={
                      <span className={cn(today && 'text-olive-700 dark:text-olive-400')}>
                        {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        {today && <span className="ml-2 text-xs bg-olive-100 dark:bg-olive-900/30 text-olive-700 dark:text-olive-400 px-2 py-0.5 rounded-full font-medium">Hoje</span>}
                      </span>
                    }
                    subtitle={`${dayAppointments.length} consulta${dayAppointments.length !== 1 ? 's' : ''}`}
                    action={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedDate(day); setAppointmentModalOpen(true); }}
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Agendar
                      </Button>
                    }
                  />
                  {dayAppointments.length > 0 && (
                    <CardBody className="p-0">
                      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {dayAppointments.map((apt) => (
                          <li key={apt.id} className="flex items-center gap-3 px-6 py-3">
                            <div className="w-12 text-center flex-shrink-0">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {format(new Date(apt.startAt), 'HH:mm')}
                              </span>
                            </div>
                            <div className={cn('w-1 h-8 rounded-full flex-shrink-0', getTypeColor(apt.type).split(' ')[0])} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {apt.baby?.name || 'Paciente'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {String(apt.type || 'Consulta').replace(/_/g, ' ')}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Legenda de tipos */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium">Tipos:</span>
        {Object.entries({ ROUTINE: 'Rotina', FOLLOW_UP: 'Retorno', EMERGENCY: 'Emergência', VACCINATION: 'Vacinação' }).map(
          ([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded-sm', getTypeColor(key).split(' ')[0])} />
              <span>{label}</span>
            </div>
          )
        )}
      </div>

      <AppointmentFormModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        defaultDate={selectedDate}
        onSuccess={load}
      />
    </div>
  );
}
