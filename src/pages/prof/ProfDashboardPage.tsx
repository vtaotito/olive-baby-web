// Olive Baby Web - Professional Dashboard
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardBody, CardHeader, Spinner } from '../../components/ui';
import { professionalService, appointmentService } from '../../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ProfDashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [patientsRes, appointmentsRes] = await Promise.all([
          professionalService.getMyPatients(),
          appointmentService.list({
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const todayAppointments = appointments.filter((a) => a.status !== 'CANCELLED' && a.status !== 'NO_SHOW');

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-olive-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              <p className="text-sm text-gray-500">Pacientes</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
              <p className="text-sm text-gray-500">Consultas hoje</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Alertas</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Consultas de hoje" subtitle={format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })} />
          <CardBody>
            {todayAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma consulta agendada para hoje</p>
            ) : (
              <ul className="space-y-3">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <li key={apt.id}>
                    <Link
                      to={`/prof/agenda`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div>
                        <p className="font-medium">{apt.baby?.name || 'Paciente'}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(apt.startAt), 'HH:mm')} - {apt.type?.replace('_', ' ')}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Pacientes recentes" />
          <CardBody>
            {patients.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum paciente vinculado</p>
            ) : (
              <ul className="space-y-3">
                {patients.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/prof/patients/${p.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-gray-500">
                          Nascido em {format(new Date(p.birthDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
