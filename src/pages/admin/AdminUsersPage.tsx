// Olive Baby Web - Admin Users Page (Tema Claro)
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Crown,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { adminService } from '../../services/adminApi';
import { Button, Spinner, Modal, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
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

  return (
    <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full border', config[role] || 'bg-gray-100 text-gray-600 border-gray-200')}>
      {role}
    </span>
  );
}

// User Actions Modal
interface UserActionsModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

function UserActionsModal({ user, isOpen, onClose }: UserActionsModalProps) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [blockReason, setBlockReason] = useState('');

  const changePlanMutation = useMutation({
    mutationFn: ({ userId, planType }: { userId: number; planType: PlanType }) =>
      adminService.changeUserPlan(userId, planType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      success('Plano alterado com sucesso');
      onClose();
    },
    onError: () => {
      error('Erro ao alterar plano');
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: number; status: UserStatus; reason?: string }) =>
      adminService.changeUserStatus(userId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      success('Status alterado com sucesso');
      onClose();
    },
    onError: () => {
      error('Erro ao alterar status');
    },
  });

  if (!user) return null;

  const isLoading = changePlanMutation.isPending || changeStatusMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ações do Usuário">
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-gray-900 font-medium">{user.caregiver?.fullName || user.email}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <RoleBadge role={user.role} />
            <PlanBadge plan={user.plan} />
            <StatusBadge status={user.status} />
          </div>
        </div>

        {/* Plan Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Alterar Plano</h4>
          <div className="flex gap-2">
            <Button
              variant={user.plan?.type === 'FREE' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => changePlanMutation.mutate({ userId: user.id, planType: 'FREE' })}
              disabled={isLoading || user.plan?.type === 'FREE'}
            >
              Free
            </Button>
            <Button
              variant={user.plan?.type === 'PREMIUM' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => changePlanMutation.mutate({ userId: user.id, planType: 'PREMIUM' })}
              disabled={isLoading || user.plan?.type === 'PREMIUM'}
              leftIcon={<Crown className="w-4 h-4" />}
            >
              Premium
            </Button>
          </div>
        </div>

        {/* Status Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Status do Usuário</h4>
          {user.status === 'BLOCKED' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeStatusMutation.mutate({ userId: user.id, status: 'ACTIVE' })}
              disabled={isLoading}
              leftIcon={<CheckCircle className="w-4 h-4" />}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              Desbloquear
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Motivo do bloqueio (opcional)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeStatusMutation.mutate({ userId: user.id, status: 'BLOCKED', reason: blockReason })}
                disabled={isLoading}
                leftIcon={<Ban className="w-4 h-4" />}
                className="text-rose-600 border-rose-300 hover:bg-rose-50"
              >
                Bloquear Usuário
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function AdminUsersPage() {
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.listUsers(filters),
  });

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, query: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof AdminUserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <AdminLayout title="Usuários">
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
          >
            Filtros
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
              <select
                value={filters.plan || ''}
                onChange={(e) => handleFilterChange('plan', e.target.value as PlanType || undefined)}
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
                onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-500"
              >
                <option value="">Todos</option>
                <option value="PARENT">Parent</option>
                <option value="CAREGIVER">Caregiver</option>
                <option value="PEDIATRICIAN">Pediatrician</option>
                <option value="SPECIALIST">Specialist</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value as UserStatus || undefined)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-olive-500"
              >
                <option value="">Todos</option>
                <option value="ACTIVE">Ativo</option>
                <option value="BLOCKED">Bloqueado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
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
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Bebês</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Cadastro</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-gray-900 font-medium">
                            {user.caregiver?.fullName || '-'}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
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
                      <td className="py-4 px-6 text-gray-900 font-medium">{user.babiesCount}</td>
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          leftIcon={<UserCog className="w-4 h-4" />}
                        >
                          Gerenciar
                        </Button>
                      </td>
                    </tr>
                  ))}
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

      {/* User Actions Modal */}
      <UserActionsModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </AdminLayout>
  );
}
