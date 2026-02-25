// Olive Baby Web - Admin Users Page (Com Drawer Lateral Unificado)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Crown,
  ChevronLeft,
  ChevronRight,
  Users,
  Baby,
  Stethoscope,
  AlertTriangle,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { adminService } from '../../services/adminApi';
import { KpiCard, SkeletonTable, UserProfileDrawer } from '../../components/admin';
import { Button, Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';
import type { AdminUser, AdminUserFilters, PlanType, UserStatus } from '../../types/admin';

// Status Badge Component
function StatusBadge({ status }: { status: UserStatus }) {
  const config = {
    ACTIVE: { label: 'Ativo', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    BLOCKED: { label: 'Bloqueado', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    PENDING_VERIFICATION: { label: 'Pendente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  };
  const { label, color } = config[status] || config.ACTIVE;

  return (
    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', color)}>
      {label}
    </span>
  );
}

// Plan Badge Component
function PlanBadge({ plan }: { plan?: { name: string; type: PlanType } }) {
  if (!plan || plan.type === 'FREE') {
    return (
      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
        Free
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-olive-50 text-olive-700 border border-olive-200">
      <Crown className="w-3 h-3" />
      Premium
    </span>
  );
}

// Role Badge Component
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, string> = {
    PARENT: 'bg-sky-50 text-sky-700 border-sky-200',
    CAREGIVER: 'bg-violet-50 text-violet-700 border-violet-200',
    PEDIATRICIAN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SPECIALIST: 'bg-rose-50 text-rose-700 border-rose-200',
    ADMIN: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const roleLabels: Record<string, string> = {
    PARENT: 'Pai/Mãe',
    CAREGIVER: 'Cuidador',
    PEDIATRICIAN: 'Pediatra',
    SPECIALIST: 'Especialista',
    ADMIN: 'Admin',
  };

  return (
    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', config[role] || 'bg-gray-100 text-gray-600 border-gray-200')}>
      {roleLabels[role] || role}
    </span>
  );
}

// Activity Indicator
function ActivityIndicator({ lastActivityAt }: { lastActivityAt?: string }) {
  if (!lastActivityAt) return <span className="text-gray-400">—</span>;
  
  const daysSince = Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSince === 0) {
    return (
      <span className="flex items-center gap-1 text-emerald-600">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        Hoje
      </span>
    );
  }
  
  if (daysSince <= 3) {
    return <span className="text-emerald-600">{daysSince}d</span>;
  }
  
  if (daysSince <= 7) {
    return <span className="text-amber-600">{daysSince}d</span>;
  }
  
  return <span className="text-rose-600">{daysSince}d</span>;
}

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 20,
    status: searchParams.get('status') as UserStatus | undefined,
    plan: searchParams.get('plan') as PlanType | undefined,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL params with filters
  useEffect(() => {
    const status = searchParams.get('status') as UserStatus | undefined;
    const plan = searchParams.get('plan') as PlanType | undefined;
    if (status || plan) {
      setFilters(prev => ({ ...prev, status, plan }));
      setShowFilters(true);
    }
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.listUsers(filters),
  });

  // Fetch summary stats
  const { data: metricsData } = useQuery({
    queryKey: ['admin-metrics', '7d'],
    queryFn: () => adminService.getMetrics('7d'),
  });

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, query: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof AdminUserFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
    // Update URL
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setSearchQuery('');
    setSearchParams({});
  };

  const users = data?.data || [];
  const pagination = data?.pagination;
  const metrics = metricsData?.data;

  const inactiveCount = users.filter(u => {
    if (!u.lastActivityAt) return true;
    const days = Math.floor((Date.now() - new Date(u.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));
    return days > 7;
  }).length;

  const professionalsCount = users.filter(u => u.role === 'PEDIATRICIAN' || u.role === 'SPECIALIST').length;

  return (
    <AdminLayout
      title="Usuários & Bebês"
      subtitle="Gerencie usuários e visualize perfis completos"
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <KpiCard
          title="Total de Usuários"
          value={metrics?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="sky"
        />
        <KpiCard
          title="Usuários Premium"
          value={metrics?.premiumUsers || 0}
          icon={<Crown className="w-6 h-6" />}
          color="olive"
        />
        <KpiCard
          title="Profissionais"
          value={professionalsCount}
          icon={<Stethoscope className="w-6 h-6" />}
          color="teal"
        />
        <KpiCard
          title="Total de Bebês"
          value={metrics?.totalBabies || 0}
          icon={<Baby className="w-6 h-6" />}
          color="violet"
        />
        <KpiCard
          title="Inativos (7d+)"
          value={inactiveCount}
          icon={<AlertTriangle className="w-6 h-6" />}
          color={inactiveCount > 10 ? 'rose' : 'amber'}
        />
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
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
            className={cn(showFilters && 'bg-olive-50 border-olive-300')}
          >
            Filtros
            {(filters.plan || filters.status || filters.role) && (
              <span className="ml-1 w-2 h-2 bg-olive-500 rounded-full" />
            )}
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
              <select
                value={filters.plan || ''}
                onChange={(e) => handleFilterChange('plan', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-500"
              >
                <option value="">Todos</option>
                <option value="FREE">Free</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-500"
              >
                <option value="">Todos</option>
                <option value="PARENT">Pai/Mãe</option>
                <option value="CAREGIVER">Cuidador</option>
                <option value="PEDIATRICIAN">Pediatra</option>
                <option value="SPECIALIST">Especialista</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-500"
              >
                <option value="">Todos</option>
                <option value="ACTIVE">Ativo</option>
                <option value="BLOCKED">Bloqueado</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-500"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <SkeletonTable rows={10} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Usuário</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Plano</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">Bebês</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-gray-500">Última Atividade</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isInactive = user.lastActivityAt && 
                      Math.floor((Date.now() - new Date(user.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)) > 7;
                    
                    return (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={cn(
                          'border-b border-gray-100 transition-colors cursor-pointer',
                          isInactive ? 'bg-rose-50/30 hover:bg-rose-50' : 'hover:bg-gray-50'
                        )}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                              user.plan?.type === 'PREMIUM' ? 'bg-olive-500' : 'bg-gray-400'
                            )}>
                              {(user.caregiver?.fullName || user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">
                                {user.caregiver?.fullName || '-'}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="py-4 px-6">
                          <PlanBadge plan={user.plan} />
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-violet-100 text-violet-700 rounded-full font-medium text-sm">
                            {user.babiesCount}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-sm">
                          <ActivityIndicator lastActivityAt={user.lastActivityAt} />
                        </td>
                        <td className="py-4 px-6 text-gray-500 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total} usuários
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
      </div>

      {/* User Profile Drawer */}
      <UserProfileDrawer
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </AdminLayout>
  );
}
