// Olive Baby Web - Notification Bell Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notificationService, babyInviteService } from '../../services/api';
import { NotificationDrawer } from './NotificationDrawer';
import { cn } from '../../lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch unread notifications count
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch pending invites count
  const { data: invitesData } = useQuery({
    queryKey: ['pending-invites'],
    queryFn: () => babyInviteService.getPendingInvites(),
    refetchInterval: 60000, // Refetch every minute
  });

  const unreadCount = notificationsData?.data?.count || 0;
  const pendingInvitesCount = invitesData?.data?.length || 0;
  const totalCount = unreadCount + pendingInvitesCount;

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={cn(
          'relative p-2 rounded-full hover:bg-gray-100 transition-colors',
          className
        )}
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        
        {totalCount > 0 && (
          <span className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-white text-[10px] font-bold rounded-full px-1",
            pendingInvitesCount > 0 ? 'bg-olive-500' : 'bg-rose-500'
          )}>
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
