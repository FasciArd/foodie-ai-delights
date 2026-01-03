import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Using the built-in Notification API instead of browser-push
// This enables in-app / in-browser notifications without needing a full service worker push setup

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return 'denied' as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [supported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!supported || permission !== 'granted') return null;
      return new Notification(title, options);
    },
    [supported, permission]
  );

  // Listen for order status changes and notify
  useEffect(() => {
    if (!user || permission !== 'granted') return;

    const channel = supabase
      .channel('order-status-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const status = payload.new?.status as string;
          const statusMessages: Record<string, string> = {
            preparing: '👨‍🍳 Your order is being prepared!',
            on_the_way: '🚴 Your order is on the way!',
            delivered: '✅ Your order has been delivered!',
            cancelled: '❌ Your order was cancelled.',
          };

          const msg = statusMessages[status];
          if (msg) {
            sendNotification('FoodieHub', { body: msg, icon: '/favicon.ico' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, permission, sendNotification]);

  return { permission, supported, requestPermission, sendNotification };
}
