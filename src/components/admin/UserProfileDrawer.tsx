// Olive Baby Web - User Profile Drawer (Enhanced)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  User,
  Baby,
  Calendar,
  Crown,
  AlertTriangle,
  Mail,
  MapPin,
  Ban,
  CheckCircle,
  Shield,
  Stethoscope,
  Trash2,
  History,
  ChevronDown,
  Copy,
  Clock,
} from 'lucide-react';
import { Drawer, DrawerSection } from './Drawer';
import { Skeleton } from './Skeleton';
import { StatusBadge, HealthStatus } from './StatusBadge';
import { adminService } from '../../services/adminApi';
import { Button, Avatar } from '../ui';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';
import type { AdminUserDetails, PlanType, AuditEvent } from '../../types/admin';

interface UserProfileDrawerProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { value: 'PARENT', label: 'Pai/Mãe', color: 'sky', icon: '👨‍👩‍👧' },
  { value: 'CAREGIVER', label: 'Cuidador', color: 'violet', icon: '🤝' },
  { value: 'PEDIATRICIAN', label: 'Pediatra', color: 'emerald', icon: '🩺' },
  { value: 'SPECIALIST', label: 'Especialista', color: 'rose', icon: '⚕️' },
  { value: 'ADMIN', label: 'Administrador', color: 'amber', icon: '🔑' },
] as const;

const AUDIT_LABELS: Record<string, { label: string; tone: 'info' | 'warning' | 'danger' | 'success' }> = {
  USER_LOGIN: { label: 'Login realizado', tone: 'info' },
  ADMIN_PLAN_CHANGED: { label: 'Plano alterado', tone: 'warning' },
  ADMIN_USER_BLOCKED: { label: 'Usuário bloqueado', tone: 'danger' },
  ADMIN_USER_UNBLOCKED: { label: 'Usuário desbloqueado', tone: 'success' },
  ADMIN_USER_ROLE_CHANGED: { label: 'Role alterada', tone: 'warning' },
  ADMIN_IMPERSONATE_START: { label: 'Impersonação iniciada', tone: 'warning' },
  PAYWALL_HIT: { label: 'Paywall acionado', tone: 'info' },
  FEATURE_USAGE: { label: 'Feature usada', tone: 'info' },
  ROUTINE_CREATED: { label: 'Rotina criada', tone: 'info' },
  BABY_CREATED: { label: 'Bebê cadastrado', tone: 'success' },
  BABY_SHARED: { label: 'Bebê compartilhado', tone: 'info' },
};

function AuditToneDot({ tone }: { tone: string }) {
  const colors: Record<string, string> = {
    info: 'bg-sky-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    success: 'bg-emerald-400',
  };
  return <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors[tone] || 'bg-gray-300')} />;
}

function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (!events.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        Nenhum evento registrado
      </p>
    );
  }

  return (
    <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
      {events.map((evt) => {
        const config = AUDIT_LABELS[evt.action] || { label: evt.action, tone: 'info' };
        const meta = evt.metadata as Record<string, unknown> | null;
        const detail = meta
          ? Object.entries(meta)
              .filter(([k]) => !['targetEmail', 'action'].includes(k))
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')
          : null;

        return (
          <div key={evt.id} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
            <AuditToneDot tone={config.tone} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700">{config.label}</p>
              {detail && (
                <p className="text-[11px] text-gray-400 truncate" title={detail}>{detail}</p>
              )}
              {evt.performedBy && evt.performedBy.id !== (evt.targetId ?? 0) && (
                <p className="text-[11px] text-gray-400">por {evt.performedBy.email}</p>
              )}
            </div>
            <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">
              {new Date(evt.createdAt).toLocaleDateString('pt-BR')}{' '}
              {new Date(evt.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function UserProfileDrawer({ userId, isOpen, onClose }: UserProfileDrawerProps) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'audit'>('info');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-details', userId],
    queryFn: () => adminService.getUserDetails(userId!),
    enabled: !!userId && isOpen,
  });

  const { data: auditData, isLoading: isLoadingAudit } = useQuery({
    queryKey: ['admin-user-audit', userId],
    queryFn: () => adminService.getUserAuditTrail(userId!, 50),
    enabled: !!userId && isOpen && activeTab === 'audit',
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-user-details', userId] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-user-audit', userId] });
  };

  const changePlanMutation = useMutation({
    mutationFn: ({ planType }: { planType: PlanType }) =>
      adminService.changeUserPlan(userId!, planType),
    onSuccess: () => { invalidateAll(); success('Plano alterado com sucesso'); },
    onError: () => error('Erro ao alterar plano'),
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ status }: { status: 'ACTIVE' | 'BLOCKED' }) =>
      adminService.changeUserStatus(userId!, status),
    onSuccess: () => { invalidateAll(); success('Status alterado com sucesso'); },
    onError: () => error('Erro ao alterar status'),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ role }: { role: string }) =>
      adminService.changeUserRole(userId!, role as any),
    onSuccess: (_, variables) => {
      invalidateAll();
      const label = ROLE_OPTIONS.find(r => r.value === variables.role)?.label || variables.role;
      success(`Role alterada para ${label}`);
      setShowRoleDropdown(false);
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Erro ao alterar role');
      setShowRoleDropdown(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminService.deleteUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      success('Usuário excluído com sucesso');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      onClose();
    },
    onError: (err: any) => {
      error(err.response?.data?.message || 'Erro ao excluir usuário');
    },
  });

  const user = data?.data;
  const auditEvents = auditData?.data || [];

  const getUserHealth = (): { status: HealthStatus; reasons: string[] } => {
    if (!user) return { status: 'neutral', reasons: [] };
    const reasons: string[] = [];
    let status: HealthStatus = 'healthy';

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
    } else {
      status = 'warning';
      reasons.push('Nunca acessou a plataforma');
    }

    if (user.status === 'BLOCKED') {
      status = 'critical';
      reasons.push('Usuário bloqueado');
    }

    return { status, reasons };
  };

  const health = getUserHealth();
  const currentRoleConfig = ROLE_OPTIONS.find(r => r.value === user?.role);
  const isProfessional = user?.role === 'PEDIATRICIAN' || user?.role === 'SPECIALIST';

  const copyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      success('Email copiado');
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil do Usuário"
      subtitle={user ? `ID #${user.id}` : undefined}
      width="lg"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : user ? (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-olive-50 to-emerald-50 rounded-xl p-4 border border-olive-100">
            <div className="flex items-start gap-4">
              <Avatar name={user.caregiver?.fullName || user.email} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {user.caregiver?.fullName || 'Sem nome'}
                  </h3>
                  {user.role === 'ADMIN' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                  {user.plan?.type === 'PREMIUM' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-olive-100 text-olive-700 text-xs font-medium rounded-full">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>

                <button
                  onClick={copyEmail}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition mt-0.5 group"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user.email}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  {user.caregiver?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.caregiver.city}{user.caregiver.state ? `, ${user.caregiver.state}` : ''}
                    </span>
                  )}
                  {user.lastActivityAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Último acesso: {new Date(user.lastActivityAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Health Alerts */}
          {health.reasons.length > 0 && (
            <div className={cn(
              'rounded-xl p-3 border',
              health.status === 'critical'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-amber-50 border-amber-200'
            )}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={cn(
                  'w-4 h-4 mt-0.5 flex-shrink-0',
                  health.status === 'critical' ? 'text-rose-500' : 'text-amber-500'
                )} />
                <div className="space-y-0.5">
                  {health.reasons.map((reason, i) => (
                    <p key={i} className={cn(
                      'text-sm',
                      health.status === 'critical' ? 'text-rose-700' : 'text-amber-700'
                    )}>{reason}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{user.babiesCount}</p>
              <p className="text-[11px] text-gray-500">Bebês</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {user.lastActivityAt
                  ? `${Math.floor((Date.now() - new Date(user.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))}d`
                  : '—'}
              </p>
              <p className="text-[11px] text-gray-500">Inativo</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <StatusBadge status={health.status} showIcon={false} size="sm" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                'flex-1 text-sm font-medium py-2 rounded-md transition-all',
                activeTab === 'info'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Informações
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={cn(
                'flex-1 text-sm font-medium py-2 rounded-md transition-all flex items-center justify-center gap-1.5',
                activeTab === 'audit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <History className="w-3.5 h-3.5" />
              Histórico
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' ? (
            <div className="space-y-5">
              {/* Role Section */}
              <DrawerSection title="Role do Usuário">
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-olive-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{currentRoleConfig?.icon || '👤'}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{currentRoleConfig?.label || user.role}</p>
                        <p className="text-xs text-gray-400">Clique para alterar</p>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-gray-400 transition-transform',
                      showRoleDropdown && 'rotate-180'
                    )} />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {ROLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            if (opt.value !== user.role) {
                              changeRoleMutation.mutate({ role: opt.value });
                            } else {
                              setShowRoleDropdown(false);
                            }
                          }}
                          disabled={changeRoleMutation.isPending}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50',
                            opt.value === user.role && 'bg-olive-50 border-l-2 border-olive-500'
                          )}
                        >
                          <span className="text-lg">{opt.icon}</span>
                          <div>
                            <p className={cn(
                              'text-sm font-medium',
                              opt.value === user.role ? 'text-olive-700' : 'text-gray-700'
                            )}>
                              {opt.label}
                            </p>
                          </div>
                          {opt.value === user.role && (
                            <span className="ml-auto text-xs text-olive-600 font-medium">Atual</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </DrawerSection>

              {/* Professional Info */}
              {isProfessional && user.professional && (
                <DrawerSection title="Perfil Profissional">
                  <div className="bg-teal-50 rounded-xl p-4 border border-teal-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-medium text-teal-800">
                        {user.professional.specialty}
                      </span>
                    </div>
                    <p className="text-sm text-teal-700">{user.professional.fullName}</p>
                    <p className="text-xs text-teal-600">{user.professional.email}</p>
                  </div>
                </DrawerSection>
              )}

              {/* Babies Section */}
              <DrawerSection title={`Bebês Vinculados (${user.babies.length})`}>
                {user.babies.length > 0 ? (
                  <div className="space-y-2">
                    {user.babies.map((baby) => (
                      <div key={baby.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                          <Baby className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{baby.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(baby.birthDate).toLocaleDateString('pt-BR')} · {baby.role}
                          </p>
                        </div>
                        <span className={cn(
                          'px-2 py-0.5 text-[11px] font-medium rounded-full',
                          baby.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        )}>
                          {baby.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum bebê cadastrado</p>
                )}
              </DrawerSection>

              {/* Subscription Info */}
              {user.subscription && (
                <DrawerSection title="Assinatura">
                  <div className="bg-olive-50 rounded-xl p-4 border border-olive-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-olive-800">{user.plan?.name || 'Premium'}</span>
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
                        Renovação: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </DrawerSection>
              )}

              {/* Plan Actions */}
              <DrawerSection title="Plano">
                <div className="flex gap-2">
                  <Button
                    variant={user.plan?.type === 'FREE' || !user.plan ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => changePlanMutation.mutate({ planType: 'FREE' })}
                    disabled={changePlanMutation.isPending || user.plan?.type === 'FREE' || !user.plan}
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
              </DrawerSection>

              {/* Status & Danger Zone */}
              <DrawerSection title="Ações">
                <div className="space-y-3">
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

              {/* Danger Zone */}
              <DrawerSection title="Zona de Perigo">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <p className="text-sm text-rose-700 mb-3">
                    Excluir o usuário removerá permanentemente todos os dados associados. Esta ação é irreversível.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setShowDeleteConfirm(true)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    className="text-rose-600 border-rose-300 hover:bg-rose-100"
                  >
                    Excluir Usuário
                  </Button>
                </div>
              </DrawerSection>

              {/* Metadata */}
              <div className="text-[11px] text-gray-400 space-y-0.5 pt-2 border-t border-gray-100">
                <p>ID: {user.id} · Criado em {new Date(user.createdAt).toLocaleString('pt-BR')}</p>
                <p>Atualizado em {new Date(user.updatedAt).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          ) : (
            /* Audit Tab */
            <div>
              {isLoadingAudit ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : (
                <AuditTimeline events={auditEvents} />
              )}
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Excluir Usuário</h3>
                    <p className="text-sm text-gray-500">Esta ação é irreversível</p>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <p className="text-sm text-rose-700">
                    Você está prestes a excluir <strong>{user.caregiver?.fullName || user.email}</strong>.
                    Todos os dados serão removidos permanentemente.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Digite <strong className="text-rose-600">EXCLUIR</strong> para confirmar:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="EXCLUIR"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteConfirmText !== 'EXCLUIR' || deleteMutation.isPending}
                    isLoading={deleteMutation.isPending}
                    className="flex-1 !bg-rose-600 hover:!bg-rose-700"
                  >
                    Excluir Permanentemente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Usuário não encontrado</p>
      )}
    </Drawer>
  );
}
