import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Package,
  ChefHat,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSoundNotifications } from "@/hooks/useSoundNotifications";
import { toast } from "sonner";

interface OrderUpdate {
  id: string;
  orderId: string;
  status: string;
  message: string;
  timestamp: Date;
}

const statusMessages: Record<
  string,
  {
    message: string;
    icon: React.ReactNode;
    soundType:
      | "orderAccepted"
      | "orderOnTheWay"
      | "orderDelivered"
      | "orderCancelled"
      | "newOrder"
      | "newDelivery"
      | "notification";
  }
> = {
  pending: {
    message: "Your order has been placed!",
    icon: <Package className="w-5 h-5" />,
    soundType: "orderAccepted",
  },
  preparing: {
    message: "Restaurant is preparing your food",
    icon: <ChefHat className="w-5 h-5" />,
    soundType: "orderAccepted",
  },
  on_the_way: {
    message: "Your rider is on the way! 🛵",
    icon: <Truck className="w-5 h-5" />,
    soundType: "orderOnTheWay",
  },
  delivered: {
    message: "Order delivered! Enjoy your meal",
    icon: <CheckCircle className="w-5 h-5" />,
    soundType: "orderDelivered",
  },
  cancelled: {
    message: "Order was cancelled",
    icon: <XCircle className="w-5 h-5" />,
    soundType: "orderCancelled",
  },
};

const OrderNotification: React.FC = () => {
  const { user, userRole } = useAuth();
  const { playSound, soundEnabled } = useSoundNotifications();
  const [notifications, setNotifications] = useState<OrderUpdate[]>([]);

  const handleOrderUpdate = useCallback(
    (payload: any, isCustomer: boolean) => {
      const newStatus = payload.new?.status as string;
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
        if (soundEnabled) {
          playSound(statusInfo.soundType);
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
    },
    [playSound, soundEnabled],
  );

  // Customer order updates
  useEffect(() => {
    if (!user?.id || userRole !== "customer") return;

    const channel = supabase
      .channel("customer-order-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => handleOrderUpdate(payload, true),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, userRole, handleOrderUpdate]);

  // Restaurant new orders
  useEffect(() => {
    if (!user?.id || userRole !== "restaurant") return;

    // First get the restaurant ID
    const setupSubscription = async () => {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!restaurant) return;

      const channel = supabase
        .channel("restaurant-order-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurant.id}`,
          },
          (payload) => {
            toast.success("New order received!", { duration: 5000 });
            if (soundEnabled) {
              playSound("newOrder");
            }
            const notification: OrderUpdate = {
              id: `${payload.new.id}-${Date.now()}`,
              orderId: payload.new.id as string,
              status: "new",
              message: "New order received!",
              timestamp: new Date(),
            };
            setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurant.id}`,
          },
          (payload) => {
            const newStatus = payload.new?.status as string;
            const oldStatus = payload.old?.status as string;

            if (newStatus === "cancelled" && oldStatus !== "cancelled") {
              toast.error("Order was cancelled", { duration: 5000 });
              if (soundEnabled) {
                playSound("orderCancelled");
              }
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [user?.id, userRole, playSound, soundEnabled]);

  // Driver delivery assignments
  useEffect(() => {
    if (!user?.id || userRole !== "driver") return;

    const setupSubscription = async () => {
      const { data: driver } = await supabase
        .from("drivers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!driver) return;

      const channel = supabase
        .channel("driver-delivery-notifications")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `driver_id=eq.${driver.id}`,
          },
          (payload) => {
            const newStatus = payload.new?.status as string;
            const oldDriverId = payload.old?.driver_id;

            // New delivery assigned
            if (!oldDriverId && payload.new?.driver_id === driver.id) {
              toast.success("New delivery assigned!", { duration: 5000 });
              if (soundEnabled) {
                playSound("newDelivery");
              }
              const notification: OrderUpdate = {
                id: `${payload.new.id}-${Date.now()}`,
                orderId: payload.new.id as string,
                status: "assigned",
                message: "New delivery assigned!",
                timestamp: new Date(),
              };
              setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [user?.id, userRole, playSound, soundEnabled]);

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
