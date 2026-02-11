// Olive Baby Web - Professional Dashboard
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  ChevronRight,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Card, CardBody, CardHeader, Spinner, Button } from '../../components/ui';
import { professionalService, appointmentService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    COMPLETED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };
  const labels: Record<string, string> = {
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}

export function ProfDashboardPage() {
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const professionalName = user?.email?.split('@')[0]?.replace(/[._-]/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Profissional';

  useEffect(() => {
    const load = async () => {
      try {
        const endOfTomorrow = new Date();
        endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);
        endOfTomorrow.setHours(0, 0, 0, 0);

        const [patientsRes, appointmentsRes] = await Promise.all([
          professionalService.getMyPatients(),
          appointmentService.list({
            startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
            endDate: endOfTomorrow.toISOString(),
          }),
        ]);
        setPatients(patientsRes?.data || []);
        setAppointments(appointmentsRes?.data || []);
      } catch {
        setPatients([]);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Carregando dashboard...</p>
      </div>
    );
  }

  const todayAppointments = appointments.filter(
    (a) => isToday(parseISO(a.startAt)) && !['CANCELLED', 'NO_SHOW'].includes(a.status)
  );
  const tomorrowAppointments = appointments.filter(
    (a) => isTomorrow(parseISO(a.startAt)) && !['CANCELLED', 'NO_SHOW'].includes(a.status)
  );
  const nextAppointment = todayAppointments
    .filter((a) => new Date(a.startAt) > new Date())
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {professionalName.split(' ')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CalendarPlus className="w-4 h-4" />}
            onClick={() => window.location.href = '/prof/agenda'}
          >
            Nova consulta
          </Button>
        </div>
      </div>

      {/* Next Appointment Banner */}
      {nextAppointment && (
        <Card className="border-l-4 border-l-olive-500 bg-olive-50/50 dark:bg-olive-900/10">
          <CardBody className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 bg-olive-100 dark:bg-olive-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-olive-600 dark:text-olive-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-olive-800 dark:text-olive-300">Próxima consulta</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {nextAppointment.baby?.name || 'Paciente'} - {format(parseISO(nextAppointment.startAt), 'HH:mm')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {String(nextAppointment.type || 'Consulta').replace(/_/g, ' ')}
              </p>
            </div>
            <Link to="/prof/agenda" className="hidden sm:flex">
              <Button variant="primary" size="sm">Ver agenda</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-olive-100 dark:bg-olive-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-olive-600 dark:text-olive-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pacientes</p>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayAppointments.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Consultas hoje</p>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{tomorrowAppointments.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Amanhã</p>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {appointments.filter((a) => a.status === 'COMPLETED').length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Realizadas</p>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments - spans 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Consultas de hoje"
              subtitle={`${todayAppointments.length} agendamento${todayAppointments.length !== 1 ? 's' : ''}`}
              action={
                <Link to="/prof/agenda">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Ver agenda
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-0">
              {todayAppointments.length === 0 ? (
                <div className="flex flex-col items-center py-12 px-6">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                    Nenhuma consulta agendada para hoje
                  </p>
                  <Link to="/prof/agenda">
                    <Button variant="outline" size="sm" leftIcon={<CalendarPlus className="w-4 h-4" />}>
                      Agendar consulta
                    </Button>
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {todayAppointments.map((apt) => (
                    <li key={apt.id}>
                      <Link
                        to="/prof/agenda"
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-olive-50 dark:bg-olive-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-olive-600 dark:text-olive-400">
                            {format(parseISO(apt.startAt), 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {apt.baby?.name || 'Paciente'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {String(apt.type || 'Consulta').replace(/_/g, ' ')}
                          </p>
                        </div>
                        <StatusBadge status={apt.status} />
                        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recent Patients */}
        <div>
          <Card>
            <CardHeader
              title="Pacientes recentes"
              action={
                <Link to="/prof/patients">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Todos
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-0">
              {patients.length === 0 ? (
                <div className="flex flex-col items-center py-10 px-6">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                    <UserPlus className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                    Nenhum paciente vinculado
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {patients.slice(0, 6).map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/prof/patients/${p.id}`}
                        className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-olive-100 dark:bg-olive-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-olive-700 dark:text-olive-400">
                            {(p.name || 'P').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(p.birthDate), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
