import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Package, ChefHat, Truck, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface OrderUpdate {
  id: string;
  orderId: string;
  status: string;
  message: string;
  timestamp: Date;
}

const statusMessages: Record<string, { message: string; icon: React.ReactNode; sound: boolean }> = {
  pending: {
    message: 'Your order has been placed! 🎉',
    icon: <Package className="w-5 h-5" />,
    sound: true,
  },
  preparing: {
    message: 'Restaurant is preparing your food 👨‍🍳',
    icon: <ChefHat className="w-5 h-5" />,
    sound: true,
  },
  on_the_way: {
    message: 'Your rider is on the way! 🛵',
    icon: <Truck className="w-5 h-5" />,
    sound: true,
  },
  delivered: {
    message: 'Order delivered! Enjoy your meal 😋',
    icon: <CheckCircle className="w-5 h-5" />,
    sound: true,
  },
};

const OrderNotification: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<OrderUpdate[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to order updates
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status as string;
          const oldStatus = payload.old?.status as string;

          // Only notify if status changed
          if (newStatus !== oldStatus && statusMessages[newStatus]) {
            const statusInfo = statusMessages[newStatus];
            
            // Show toast notification
            toast(statusInfo.message, {
              icon: statusInfo.icon,
              duration: 5000,
            });

            // Play notification sound
            if (statusInfo.sound) {
              try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {});
              } catch (e) {
                // Audio not available
              }
            }

            // Add to notifications list
            const notification: OrderUpdate = {
              id: `${payload.new.id}-${Date.now()}`,
              orderId: payload.new.id,
              status: newStatus,
              message: statusInfo.message,
              timestamp: new Date(),
            };

            setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-card border border-border rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Order #{notification.orderId.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default OrderNotification;
