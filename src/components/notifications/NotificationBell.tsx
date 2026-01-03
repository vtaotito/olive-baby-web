// Olive Baby Web - Notification Bell Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/api';
import { NotificationDrawer } from './NotificationDrawer';
import { cn } from '../../lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, // Refetch every minute
  });

  const unreadCount = data?.data?.count || 0;

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
        
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
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
