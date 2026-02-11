// Olive Baby Web - Professional Patients List
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Users, Baby, Filter, SortAsc } from 'lucide-react';
import { Card, CardBody, CardHeader, Spinner, Input, Button } from '../../components/ui';
import { professionalService } from '../../services/api';
import { format, differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';

function formatPatientAge(birthDate: string): string {
  const birth = parseISO(birthDate);
  const now = new Date();
  const years = differenceInYears(now, birth);
  if (years >= 1) return `${years} ano${years > 1 ? 's' : ''}`;
  const months = differenceInMonths(now, birth);
  if (months >= 1) return `${months} ${months > 1 ? 'meses' : 'mês'}`;
  const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  return `${days} dia${days !== 1 ? 's' : ''}`;
}

function PatientAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const colors = [
    'bg-olive-100 text-olive-700 dark:bg-olive-900/30 dark:text-olive-400',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  ];
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm', colors[colorIndex], className)}>
      {initials}
    </div>
  );
}

type SortKey = 'name' | 'birthDate';

export function ProfPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');

  useEffect(() => {
    professionalService
      .getMyPatients()
      .then((r) => {
        setPatients(r?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPatients = useMemo(() => {
    let result = patients;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.primaryCaregiver?.fullName?.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
    });
    return result;
  }, [patients, search, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pacientes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} vinculado{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      {patients.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome do paciente ou responsável..."
              leftIcon={<Search className="w-5 h-5" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'name' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<SortAsc className="w-4 h-4" />}
              onClick={() => setSortBy('name')}
            >
              Nome
            </Button>
            <Button
              variant={sortBy === 'birthDate' ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Baby className="w-4 h-4" />}
              onClick={() => setSortBy('birthDate')}
            >
              Idade
            </Button>
          </div>
        </div>
      )}

      {/* Patient List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" />
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">Carregando pacientes...</p>
        </div>
      ) : patients.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum paciente vinculado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
              Quando famílias vincularem você como profissional de saúde dos seus bebês, os pacientes aparecerão aqui.
            </p>
          </CardBody>
        </Card>
      ) : filteredPatients.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Nenhum paciente encontrado para "<strong>{search}</strong>"
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPatients.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/prof/patients/${p.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <PatientAvatar name={p.name || 'Paciente'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-olive-600 dark:group-hover:text-olive-400 transition-colors">
                        {p.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatPatientAge(p.birthDate)}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Nasc. {format(parseISO(p.birthDate), 'dd/MM/yyyy')}
                        </span>
                        {p.primaryCaregiver?.fullName && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              Resp: {p.primaryCaregiver.fullName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-olive-500 transition-colors flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
