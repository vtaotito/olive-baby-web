// Olive Baby Web - Notification Drawer Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Bell,
  Archive,
  Check,
  CheckCheck,
  Trash2,
  Lightbulb,
  AlertTriangle,
  Clock,
  Trophy,
  Info,
  UserPlus,
  Baby,
  Users,
  Shield,
  Crown,
  XCircle,
} from 'lucide-react';
import { notificationService, babyInviteService } from '../../services/api';
import { useToast } from '../ui/Toast';
import { Button } from '../ui';
import { cn } from '../../lib/utils';
import { useBabyStore } from '../../stores/babyStore';
import type { Notification, NotificationStatus, NotificationType } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'invites' | 'unread' | 'archived';

// Types for pending invites
interface PendingInvite {
  id: number;
  babyId: number;
  babyName: string;
  babyBirthDate: string;
  memberType: 'PARENT' | 'FAMILY' | 'PROFESSIONAL';
  role: string;
  invitedName?: string;
  message?: string;
  inviterEmail: string;
  inviterName: string;
  expiresAt: string;
  createdAt: string;
}

const typeIcons: Record<NotificationType, typeof Lightbulb> = {
  INSIGHT: Lightbulb,
  ALERT: AlertTriangle,
  REMINDER: Clock,
  SYSTEM: Info,
  ACHIEVEMENT: Trophy,
};

const typeColors: Record<NotificationType, string> = {
  INSIGHT: 'bg-olive-100 text-olive-600',
  ALERT: 'bg-rose-100 text-rose-600',
  REMINDER: 'bg-blue-100 text-blue-600',
  SYSTEM: 'bg-gray-100 text-gray-600',
  ACHIEVEMENT: 'bg-amber-100 text-amber-600',
};

const memberTypeIcons: Record<string, typeof Users> = {
  PARENT: Crown,
  FAMILY: Users,
  PROFESSIONAL: Shield,
};

const roleLabels: Record<string, string> = {
  OWNER_PARENT_1: 'Responsável Principal',
  OWNER_PARENT_2: 'Responsável Principal',
  FAMILY_VIEWER: 'Familiar (Visualização)',
  FAMILY_EDITOR: 'Familiar (Edição)',
  PEDIATRICIAN: 'Pediatra',
  OBGYN: 'Obstetra/Ginecologista',
  LACTATION_CONSULTANT: 'Consultora de Amamentação',
  NUTRITIONIST: 'Nutricionista',
  PSYCHOLOGIST: 'Psicólogo(a)',
  SPEECH_THERAPIST: 'Fonoaudiólogo(a)',
  PHYSIOTHERAPIST: 'Fisioterapeuta',
  OCCUPATIONAL_THERAPIST: 'Terapeuta Ocupacional',
  NANNY: 'Babá',
  CAREGIVER: 'Cuidador(a)',
  OTHER: 'Outro',
};

const memberTypeLabels: Record<string, string> = {
  PARENT: 'Responsável',
  FAMILY: 'Familiar',
  PROFESSIONAL: 'Profissional',
};

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('invites');
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const { fetchBabies } = useBabyStore();

  const status: NotificationStatus = activeTab === 'unread' ? 'UNREAD' : 'ARCHIVED';

  // Query for notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', status],
    queryFn: () => notificationService.list({ status, limit: 50 }),
    enabled: isOpen && activeTab !== 'invites',
  });

  // Query for pending invites
  const { data: invitesData, isLoading: invitesLoading } = useQuery({
    queryKey: ['pending-invites'],
    queryFn: () => babyInviteService.getPendingInvites(),
    enabled: isOpen,
  });

  const pendingInvites: PendingInvite[] = invitesData?.data || [];

  // Accept invite mutation
  const acceptInviteMutation = useMutation({
    mutationFn: (inviteId: number) => babyInviteService.acceptInviteById(inviteId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      queryClient.invalidateQueries({ queryKey: ['babies'] });
      success('Convite aceito!', data.message || 'Você agora tem acesso ao bebê');
      // Refresh babies list
      fetchBabies();
    },
    onError: (err: any) => {
      showError('Erro', err.response?.data?.message || 'Não foi possível aceitar o convite');
    },
  });

  // Reject invite mutation
  const rejectInviteMutation = useMutation({
    mutationFn: (inviteId: number) => babyInviteService.rejectInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      success('Convite recusado');
    },
    onError: (err: any) => {
      showError('Erro', err.response?.data?.message || 'Não foi possível recusar o convite');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => notificationService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      success('Notificação arquivada');
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      success('Todas marcadas como lidas');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
      success('Notificação removida');
    },
  });

  const notifications: Notification[] = data?.data || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-olive-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('invites')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'invites'
                ? 'text-olive-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <span className="flex items-center justify-center gap-1">
              Convites
              {pendingInvites.length > 0 && (
                <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px]">
                  {pendingInvites.length}
                </span>
              )}
            </span>
            {activeTab === 'invites' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'unread'
                ? 'text-olive-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Não lidas
            {activeTab === 'unread' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'archived'
                ? 'text-olive-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Arquivadas
            {activeTab === 'archived' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-500" />
            )}
          </button>
        </div>

        {/* Actions */}
        {activeTab === 'unread' && notifications.length > 0 && (
          <div className="p-2 border-b bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              leftIcon={<CheckCheck className="w-4 h-4" />}
              className="text-sm"
            >
              Marcar todas como lidas
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Invites Tab */}
          {activeTab === 'invites' && (
            <>
              {invitesLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : pendingInvites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <UserPlus className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">Nenhum convite pendente</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Quando você receber um convite, ele aparecerá aqui
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingInvites.map(invite => {
                    const MemberIcon = memberTypeIcons[invite.memberType] || Users;
                    const expiresAt = new Date(invite.expiresAt);
                    const hoursLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 3600000));
                    
                    return (
                      <div key={invite.id} className="p-4 bg-gradient-to-r from-olive-50/50 to-transparent">
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Baby className="w-6 h-6 text-olive-600" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              Convite para acompanhar {invite.babyName}
                            </h4>
                            <p className="text-sm text-gray-600 mt-0.5">
                              De: {invite.inviterName}
                            </p>
                            
                            {/* Role info */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                                <MemberIcon className="w-3 h-3" />
                                {memberTypeLabels[invite.memberType]}
                              </span>
                              <span className="text-xs text-gray-500">
                                {roleLabels[invite.role] || invite.role}
                              </span>
                            </div>

                            {/* Message if any */}
                            {invite.message && (
                              <p className="text-xs text-gray-500 mt-2 italic">
                                "{invite.message}"
                              </p>
                            )}

                            {/* Expiration */}
                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {hoursLeft > 24 
                                ? `Expira em ${Math.floor(hoursLeft / 24)} dias` 
                                : hoursLeft > 0 
                                  ? `Expira em ${hoursLeft}h`
                                  : 'Expira em breve'
                              }
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => acceptInviteMutation.mutate(invite.id)}
                                disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                                isLoading={acceptInviteMutation.isPending}
                                leftIcon={<Check className="w-4 h-4" />}
                              >
                                Aceitar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectInviteMutation.mutate(invite.id)}
                                disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                                isLoading={rejectInviteMutation.isPending}
                                leftIcon={<XCircle className="w-4 h-4" />}
                              >
                                Recusar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Notifications Tab (unread/archived) */}
          {activeTab !== 'invites' && (
            <>
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  {activeTab === 'unread' ? (
                    <>
                      <Bell className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">Nenhuma notificação</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Você está em dia! 🎉
                      </p>
                    </>
                  ) : (
                    <>
                      <Archive className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">Nenhuma notificação arquivada</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map(notification => {
                    const Icon = typeIcons[notification.type];
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 hover:bg-gray-50 transition-colors',
                          notification.status === 'UNREAD' && 'bg-olive-50/50'
                        )}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                            typeColors[notification.type]
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatDate(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>

                            {/* CTA */}
                            {notification.ctaUrl && (
                              <a
                                href={notification.ctaUrl}
                                className="inline-block mt-2 text-sm font-medium text-olive-600 hover:text-olive-700"
                              >
                                {notification.ctaLabel || 'Ver mais'} →
                              </a>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-2">
                              {notification.status === 'UNREAD' && (
                                <>
                                  <button
                                    onClick={() => markAsReadMutation.mutate(notification.id)}
                                    disabled={markAsReadMutation.isPending}
                                    className="text-xs text-gray-500 hover:text-olive-600 flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Marcar como lida
                                  </button>
                                  <span className="text-gray-300">•</span>
                                </>
                              )}
                              {notification.status !== 'ARCHIVED' && (
                                <button
                                  onClick={() => archiveMutation.mutate(notification.id)}
                                  disabled={archiveMutation.isPending}
                                  className="text-xs text-gray-500 hover:text-amber-600 flex items-center gap-1"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  Arquivar
                                </button>
                              )}
                              {notification.status === 'ARCHIVED' && (
                                <button
                                  onClick={() => deleteMutation.mutate(notification.id)}
                                  disabled={deleteMutation.isPending}
                                  className="text-xs text-gray-500 hover:text-rose-600 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Excluir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
