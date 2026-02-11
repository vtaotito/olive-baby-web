// Olive Baby Web - Professional Patients List
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card, CardBody, Spinner } from '../../components/ui';
import { professionalService } from '../../services/api';
import { format } from 'date-fns';

export function ProfPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    professionalService.getMyPatients().then((r) => {
      setPatients(r?.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pacientes</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            {patients.length === 0 ? (
              <p className="text-center py-12 text-gray-500">Nenhum paciente vinculado</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {patients.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/prof/patients/${p.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-gray-500">
                          Nascido em {format(new Date(p.birthDate), 'dd/MM/yyyy')} • {p.primaryCaregiver?.fullName || 'Responsável'}
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
      )}
    </>
  );
}
