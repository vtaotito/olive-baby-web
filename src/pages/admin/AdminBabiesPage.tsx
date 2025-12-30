// Olive Baby Web - Admin Babies Page (Tema Claro)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Baby,
  Users,
  Stethoscope,
  Activity,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { adminService } from '../../services/adminApi';
import { Button, Spinner } from '../../components/ui';
import { cn, formatAge } from '../../lib/utils';
import type { AdminBaby, AdminBabyFilters } from '../../types/admin';

// Brazilian States
const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function AdminBabiesPage() {
  const [filters, setFilters] = useState<AdminBabyFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-babies', filters],
    queryFn: () => adminService.listBabies(filters),
  });

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, query: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof AdminBabyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const babies = data?.data || [];
  const pagination = data?.pagination;

  return (
    <AdminLayout title="Bebês">
      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome do bebê..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filtros
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.state || ''}
                onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-500"
              >
                <option value="">Todos os estados</option>
                {BRAZILIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Babies Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {babies.map((baby) => (
              <BabyCard key={baby.id} baby={baby} />
            ))}
          </div>

          {babies.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <Baby className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum bebê encontrado</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
              <p className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} bebês
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                  disabled={pagination.page === 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

// Baby Card Component - Tema Claro
function BabyCard({ baby }: { baby: AdminBaby }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-center">
            <Baby className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold">{baby.name}</h3>
            <p className="text-sm text-gray-500">{formatAge(baby.birthDate)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 text-center">
          <Users className="w-4 h-4 text-sky-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{baby.caregiversCount}</p>
          <p className="text-xs text-gray-500">Cuidadores</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
          <Stethoscope className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{baby.professionalsCount}</p>
          <p className="text-xs text-gray-500">Profissionais</p>
        </div>
        <div className="bg-olive-50 border border-olive-100 rounded-lg p-3 text-center">
          <Activity className="w-4 h-4 text-olive-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{baby.routinesCount30d}</p>
          <p className="text-xs text-gray-500">Rotinas/30d</p>
        </div>
      </div>

      {/* Primary Caregiver */}
      {baby.primaryCaregiver && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-2">Responsável Principal</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 font-medium">{baby.primaryCaregiver.fullName}</p>
              <p className="text-xs text-gray-500">{baby.primaryCaregiver.email}</p>
            </div>
            <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded-full">
              {baby.primaryCaregiver.relationship.toLowerCase()}
            </span>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{baby.city ? `${baby.city}, ${baby.state}` : baby.state || '-'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(baby.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}
