// Olive Baby Web - User Profile Drawer (Perfil Unificado)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Baby,
  Calendar,
  Activity,
  Crown,
  AlertTriangle,
  Mail,
  MapPin,
  Clock,
  Zap,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { Drawer, DrawerSection } from './Drawer';
import { Skeleton } from './Skeleton';
import { StatusBadge, HealthStatus } from './StatusBadge';
import { adminService } from '../../services/adminApi';
import { Button, Avatar } from '../ui';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';
import type { AdminUserDetails, PlanType } from '../../types/admin';

interface UserProfileDrawerProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileDrawer({ userId, isOpen, onClose }: UserProfileDrawerProps) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-details', userId],
    queryFn: () => adminService.getUserDetails(userId!),
    enabled: !!userId && isOpen,
  });

  const changePlanMutation = useMutation({
    mutationFn: ({ planType }: { planType: PlanType }) =>
      adminService.changeUserPlan(userId!, planType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-details', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      success('Plano alterado com sucesso');
    },
    onError: () => error('Erro ao alterar plano'),
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ status }: { status: 'ACTIVE' | 'BLOCKED' }) =>
      adminService.changeUserStatus(userId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-details', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      success('Status alterado com sucesso');
    },
    onError: () => error('Erro ao alterar status'),
  });

  const user = data?.data;

  // Calculate user health status
  const getUserHealth = (): { status: HealthStatus; reasons: string[] } => {
    if (!user) return { status: 'neutral', reasons: [] };
    
    const reasons: string[] = [];
    let status: HealthStatus = 'healthy';

    // Check last activity
    if (user.lastActivityAt) {
      const daysSinceActivity = Math.floor(
        (Date.now() - new Date(user.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceActivity > 14) {
        status = 'critical';
        reasons.push(`Inativo há ${daysSinceActivity} dias`);
      } else if (daysSinceActivity > 7) {
        status = 'warning';
        reasons.push(`Sem atividade há ${daysSinceActivity} dias`);
      }
    }

    // Check blocked status
    if (user.status === 'BLOCKED') {
      status = 'critical';
      reasons.push('Usuário bloqueado');
    }

    return { status, reasons };
  };

  const health = getUserHealth();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil do Usuário"
      subtitle={user?.email}
      width="lg"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-olive-50 to-emerald-50 rounded-xl p-4 border border-olive-100">
            <div className="flex items-start gap-4">
              <Avatar
                name={user.caregiver?.fullName || user.email}
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.caregiver?.fullName || 'Sem nome'}
                  </h3>
                  {user.plan?.type === 'PREMIUM' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-olive-100 text-olive-700 text-xs font-medium rounded-full">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  {user.caregiver?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.caregiver.city}, {user.caregiver.state}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Health Alerts */}
          {health.reasons.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-medium text-rose-800">Alertas</p>
                  <ul className="mt-1 space-y-1">
                    {health.reasons.map((reason, i) => (
                      <li key={i} className="text-sm text-rose-700">{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{user.babiesCount}</p>
              <p className="text-xs text-gray-500">Bebês</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {user.lastActivityAt
                  ? Math.floor((Date.now() - new Date(user.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))
                  : '—'}
              </p>
              <p className="text-xs text-gray-500">Dias inativo</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <StatusBadge status={health.status} showIcon={false} size="sm" />
            </div>
          </div>

          {/* Babies Section */}
          <DrawerSection title="Bebês Vinculados">
            {user.babies.length > 0 ? (
              <div className="space-y-2">
                {user.babies.map((baby) => (
                  <div
                    key={baby.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                      <Baby className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{baby.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(baby.birthDate).toLocaleDateString('pt-BR')} • {baby.role}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      baby.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {baby.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum bebê cadastrado
              </p>
            )}
          </DrawerSection>

          {/* Subscription Info */}
          {user.subscription && (
            <DrawerSection title="Assinatura">
              <div className="bg-olive-50 rounded-xl p-4 border border-olive-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-olive-800">
                    {user.plan?.name || 'Premium'}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    user.subscription.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  )}>
                    {user.subscription.status}
                  </span>
                </div>
                {user.subscription.currentPeriodEnd && (
                  <p className="text-sm text-olive-600">
                    Próxima renovação: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </DrawerSection>
          )}

          {/* Actions */}
          <DrawerSection title="Ações">
            <div className="space-y-3">
              {/* Plan Actions */}
              <div className="flex gap-2">
                <Button
                  variant={user.plan?.type === 'FREE' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => changePlanMutation.mutate({ planType: 'FREE' })}
                  disabled={changePlanMutation.isPending || user.plan?.type === 'FREE'}
                  className="flex-1"
                >
                  Free
                </Button>
                <Button
                  variant={user.plan?.type === 'PREMIUM' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => changePlanMutation.mutate({ planType: 'PREMIUM' })}
                  disabled={changePlanMutation.isPending || user.plan?.type === 'PREMIUM'}
                  leftIcon={<Crown className="w-4 h-4" />}
                  className="flex-1"
                >
                  Premium
                </Button>
              </div>

              {/* Status Actions */}
              {user.status === 'BLOCKED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => changeStatusMutation.mutate({ status: 'ACTIVE' })}
                  disabled={changeStatusMutation.isPending}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                >
                  Desbloquear Usuário
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => changeStatusMutation.mutate({ status: 'BLOCKED' })}
                  disabled={changeStatusMutation.isPending}
                  leftIcon={<Ban className="w-4 h-4" />}
                  className="text-rose-600 border-rose-300 hover:bg-rose-50"
                >
                  Bloquear Usuário
                </Button>
              )}
            </div>
          </DrawerSection>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Usuário não encontrado</p>
      )}
    </Drawer>
  );
}
