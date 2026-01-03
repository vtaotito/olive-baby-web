// Olive Baby Web - Notifications Hook
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/api';
import type { Notification, NotificationStatus, NotificationType } from '../types';

interface UseNotificationsOptions {
  status?: NotificationStatus;
  type?: NotificationType;
  babyId?: number;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { status, type, babyId, enabled = true } = options;

  const query = useQuery({
    queryKey: ['notifications', status, type, babyId],
    queryFn: async () => {
      const response = await notificationService.list({
        status,
        type,
        babyId,
        limit: 50,
      });
      return response;
    },
    enabled,
    staleTime: 30000, // 30 segundos
  });

  const notifications: Notification[] = query.data?.data || [];

  return {
    notifications,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useUnreadCount() {
  const query = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  return {
    count: query.data?.data?.count || 0,
    isLoading: query.isLoading,
  };
}

export function useInsightNotifications(babyId?: number) {
  return useNotifications({
    status: 'UNREAD',
    type: 'INSIGHT',
    babyId,
    enabled: !!babyId,
  });
}
