import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { isPast } from 'date-fns';

export interface AccountLock {
  id: string;
  user_id: string;
  reason: string;
  tax_bill_id: string | null;
  locked_at: string;
  unlocked_at: string | null;
  is_active: boolean;
}

export interface AccountStatus {
  isLocked: boolean;
  lock: AccountLock | null;
  overdueTaxBills: number;
  totalOverdueAmount: number;
}

export function useAccountLock() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['account-lock', user?.id],
    queryFn: async (): Promise<AccountStatus> => {
      if (!user) return { isLocked: false, lock: null, overdueTaxBills: 0, totalOverdueAmount: 0 };

      // Check for active lock
      const { data: lockData } = await supabase
        .from('account_locks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      // Check for overdue tax bills (pending + past due date)
      const { data: taxBills } = await supabase
        .from('tax_bills')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      const overdueBills = (taxBills || []).filter(bill => isPast(new Date(bill.due_date)));
      const totalOverdueAmount = overdueBills.reduce((sum, bill) => sum + Number(bill.tax_amount), 0);

      // If there are overdue bills but no lock, the system should create one
      // This is checked on the backend/edge function side

      return {
        isLocked: !!lockData?.is_active,
        lock: lockData as AccountLock | null,
        overdueTaxBills: overdueBills.length,
        totalOverdueAmount,
      };
    },
    enabled: !!user,
    refetchInterval: 60000, // Check every minute
  });
}
