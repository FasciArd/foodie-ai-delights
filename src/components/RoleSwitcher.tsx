import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Store, Bike, Shield, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface RoleOption {
  id: AppRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roles: RoleOption[] = [
  {
    id: 'customer',
    label: 'Customer',
    description: 'Order food from restaurants',
    icon: <User className="w-5 h-5" />,
    color: 'bg-blue-500',
  },
  {
    id: 'restaurant',
    label: 'Restaurant Owner',
    description: 'Manage your restaurant & menu',
    icon: <Store className="w-5 h-5" />,
    color: 'bg-primary',
  },
  {
    id: 'driver',
    label: 'Delivery Rider',
    description: 'Deliver orders & earn money',
    icon: <Bike className="w-5 h-5" />,
    color: 'bg-emerald-500',
  },
];

interface RoleSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleSwitcher({ open, onOpenChange }: RoleSwitcherProps) {
  const { userRole, changeRole, refreshRole } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  const handleSwitchRole = async (role: AppRole) => {
    if (role === userRole) {
      onOpenChange(false);
      return;
    }

    setSwitching(true);
    setSelectedRole(role);

    try {
      const { error } = await changeRole(role);
      if (error) throw error;

      await refreshRole();

      toast.success(`Switched to ${role === 'restaurant' ? 'Restaurant Owner' : role === 'driver' ? 'Delivery Rider' : 'Customer'} mode`);

      // Redirect to appropriate dashboard
      const dashboardPaths: Record<AppRole, string> = {
        customer: '/',
        restaurant: '/restaurant-dashboard',
        driver: '/delivery-dashboard',
        admin: '/admin',
      };

      onOpenChange(false);
      navigate(dashboardPaths[role], { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to switch role');
    } finally {
      setSwitching(false);
      setSelectedRole(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Switch Role
          </DialogTitle>
          <DialogDescription>
            Choose how you want to use FoodieHub. Your data is preserved across role switches.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {roles.map((role) => {
            const isCurrent = userRole === role.id;
            const isLoading = switching && selectedRole === role.id;

            return (
              <motion.button
                key={role.id}
                whileHover={{ scale: isCurrent ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSwitchRole(role.id)}
                disabled={switching}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                  isCurrent
                    ? 'border-primary bg-primary/10 cursor-default'
                    : 'border-border hover:border-primary/50 cursor-pointer'
                } ${switching && !isLoading ? 'opacity-50' : ''}`}
              >
                <div className={`p-2.5 rounded-xl ${role.color} text-white`}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{role.label}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
                {isCurrent && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
                {isLoading && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          {userRole === 'admin' && (
            <p className="flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              You have admin privileges
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
