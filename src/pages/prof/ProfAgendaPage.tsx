// Olive Baby Web - Professional Agenda
import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Spinner } from '../../components/ui';
import { AppointmentFormModal } from '../../components/prof';
import { appointmentService, professionalService } from '../../services/api';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ProfAgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const end = endOfWeek(weekStart, { weekStartsOn: 0 });
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
    acc[key] = appointments.filter((a) => format(new Date(a.startAt), 'yyyy-MM-dd') === key && !['CANCELLED', 'NO_SHOW'].includes(a.status));
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Agenda</h1>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            ← Semana anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Próxima semana →
          </Button>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setSelectedDate(undefined); setAppointmentModalOpen(true); }}>
          Novo agendamento
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <Card key={day.toISOString()}>
              <CardHeader
                title={format(day, 'EEE', { locale: ptBR })}
                subtitle={format(day, 'dd/MM')}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setSelectedDate(day); setAppointmentModalOpen(true); }}
                  >
                    +
                  </Button>
                }
              />
              <CardBody className="min-h-[200px]">
                {(appointmentsByDay[format(day, 'yyyy-MM-dd')] || []).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-2 mb-2 rounded bg-olive-50 dark:bg-olive-900/20 text-sm"
                  >
                    <p className="font-medium">{apt.baby?.name || 'Paciente'}</p>
                    <p className="text-gray-500">
                      {format(new Date(apt.startAt), 'HH:mm')} - {String(apt.type || '').replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <AppointmentFormModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        defaultDate={selectedDate}
        onSuccess={load}
      />
    </>
  );
}
