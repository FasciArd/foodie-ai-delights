import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Wallet,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowDownToLine,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSoundNotifications } from "@/hooks/useSoundNotifications";
import { toast } from "sonner";
import { formatPKR } from "@/lib/currency";

interface Notification {
  id: string;
  type: "earnings" | "withdrawal" | "tax" | "lock" | "system";
  title: string;
  message: string;
  timestamp: Date;
  icon: React.ReactNode;
}

const EnhancedNotifications: React.FC = () => {
  const { user, userRole } = useAuth();
  const { playSound, soundEnabled } = useSoundNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);

      // Store in localStorage for notification panel
      const stored = localStorage.getItem("foodie-notifications");
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [
        { ...newNotification, read: false },
        ...existing.slice(0, 49),
      ];
      localStorage.setItem("foodie-notifications", JSON.stringify(updated));
      window.dispatchEvent(new Event("notifications-updated"));

      if (soundEnabled) {
        playSound("notification");
      }
    },
    [playSound, soundEnabled],
  );

  // Listen for earnings updates (for restaurant/driver)
  useEffect(() => {
    if (!user?.id || !["restaurant", "driver"].includes(userRole || "")) return;

    const channel = supabase
      .channel("earnings-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "earnings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const earning = payload.new as any;
          const amount = Number(earning.net_amount);

          toast.success(`Earnings credited: ${formatPKR(amount)}`, {
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
            duration: 5000,
          });

          addNotification({
            type: "earnings",
            title: "Earnings Credited",
            message: `${formatPKR(amount)} added to your wallet`,
            icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, userRole, addNotification]);

  // Listen for withdrawal updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("withdrawal-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "withdrawals",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const withdrawal = payload.new as any;
          const oldStatus = (payload.old as any)?.status;
          const newStatus = withdrawal.status;

          if (oldStatus !== newStatus) {
            const messages: Record<string, { title: string; message: string }> =
              {
                processing: {
                  title: "Withdrawal Processing",
                  message: `Your withdrawal of ${formatPKR(withdrawal.amount)} is being processed`,
                },
                completed: {
                  title: "Withdrawal Completed",
                  message: `${formatPKR(withdrawal.amount)} has been sent to your account`,
                },
                rejected: {
                  title: "Withdrawal Rejected",
                  message:
                    "Your withdrawal request was rejected. Please contact support.",
                },
              };

            const msg = messages[newStatus];
            if (msg) {
              toast(msg.title, {
                description: msg.message,
                icon:
                  newStatus === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : newStatus === "rejected" ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <ArrowDownToLine className="w-5 h-5 text-primary" />
                  ),
                duration: 5000,
              });

              addNotification({
                type: "withdrawal",
                title: msg.title,
                message: msg.message,
                icon: <ArrowDownToLine className="w-5 h-5 text-primary" />,
              });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, addNotification]);

  // Listen for tax bill creation
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("tax-bill-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tax_bills",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const taxBill = payload.new as any;

          toast("Tax Bill Generated", {
            description: `Tax of ${formatPKR(taxBill.tax_amount)} is due within 30 days`,
            icon: <FileText className="w-5 h-5 text-amber-500" />,
            duration: 7000,
          });

          addNotification({
            type: "tax",
            title: "Tax Bill Generated",
            message: `Pay ${formatPKR(taxBill.tax_amount)} within 30 days to avoid account lock`,
            icon: <FileText className="w-5 h-5 text-amber-500" />,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, addNotification]);

  // Listen for account locks
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("account-lock-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "account_locks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const lock = payload.new as any;

          if (lock.is_active) {
            toast.error("Account Locked", {
              description: "Your account has been locked due to unpaid taxes",
              icon: <Lock className="w-5 h-5" />,
              duration: 10000,
            });

            addNotification({
              type: "lock",
              title: "Account Locked",
              message:
                "Please pay outstanding tax bills to unlock your account",
              icon: <Lock className="w-5 h-5 text-destructive" />,
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "account_locks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const lock = payload.new as any;
          const oldLock = payload.old as any;

          if (oldLock.is_active && !lock.is_active) {
            toast.success("Account Unlocked", {
              description: "Your account has been restored",
              icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
              duration: 5000,
            });

            addNotification({
              type: "system",
              title: "Account Unlocked",
              message: "Your account access has been restored",
              icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, addNotification]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[100] space-y-2 max-w-sm">
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
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                {notification.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-muted-foreground hover:text-foreground shrink-0"
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

export default EnhancedNotifications;
