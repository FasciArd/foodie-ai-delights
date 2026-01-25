import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Earning {
  id: string;
  user_id: string;
  order_id: string | null;
  user_type: 'restaurant' | 'homechef' | 'driver';
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  status: 'pending' | 'available' | 'withdrawn';
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: 'easypaisa' | 'jazzcash' | 'bank';
  account_number: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  transaction_ref: string | null;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
}

export function useEarnings(userType?: 'restaurant' | 'homechef' | 'driver') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['earnings', user?.id, userType],
    queryFn: async (): Promise<Earning[]> => {
      if (!user) return [];

      let query = supabase
        .from('earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filter by user_type if provided to ensure role isolation
      if (userType) {
        if (userType === 'restaurant') {
          // Restaurant owners see both restaurant and homechef earnings
          query = query.in('user_type', ['restaurant', 'homechef']);
        } else {
          query = query.eq('user_type', userType);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Earning[];
    },
    enabled: !!user,
  });
}

export function useEarningsSummary(userType?: 'restaurant' | 'homechef' | 'driver') {
  const { data: earnings = [] } = useEarnings(userType);

  const totalGross = earnings.reduce((sum, e) => sum + e.gross_amount, 0);
  const totalCommission = earnings.reduce((sum, e) => sum + e.commission_amount, 0);
  const totalNet = earnings.reduce((sum, e) => sum + e.net_amount, 0);
  const availableBalance = earnings
    .filter(e => e.status === 'available')
    .reduce((sum, e) => sum + e.net_amount, 0);
  const pendingBalance = earnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.net_amount, 0);
  const withdrawnBalance = earnings
    .filter(e => e.status === 'withdrawn')
    .reduce((sum, e) => sum + e.net_amount, 0);

  return {
    totalGross,
    totalCommission,
    totalNet,
    availableBalance,
    pendingBalance,
    withdrawnBalance,
    earnings,
  };
}

export function useWithdrawals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async (): Promise<Withdrawal[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Withdrawal[];
    },
    enabled: !!user,
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      amount,
      method,
      accountNumber,
    }: {
      amount: number;
      method: 'easypaisa' | 'jazzcash' | 'bank';
      accountNumber: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount,
          method,
          account_number: accountNumber,
          status: 'pending',
        })
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;

      // Mark earnings as withdrawn (up to the withdrawal amount)
      const { data: availableEarnings } = await supabase
        .from('earnings')
        .select('id, net_amount')
        .eq('user_id', user.id)
        .eq('status', 'available')
        .order('created_at', { ascending: true });

      if (availableEarnings) {
        let remainingAmount = amount;
        for (const earning of availableEarnings) {
          if (remainingAmount <= 0) break;
          
          if (earning.net_amount <= remainingAmount) {
            await supabase
              .from('earnings')
              .update({ status: 'withdrawn' })
              .eq('id', earning.id);
            remainingAmount -= earning.net_amount;
          }
        }
      }

      return withdrawal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals', user?.id] });
    },
  });
}

export function useAddEarning() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      orderId,
      userType,
      grossAmount,
      commissionRate = 0.10,
    }: {
      orderId: string;
      userType: 'restaurant' | 'homechef' | 'driver';
      grossAmount: number;
      commissionRate?: number;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const commissionAmount = grossAmount * commissionRate;
      const netAmount = grossAmount - commissionAmount;

      const { data, error } = await supabase
        .from('earnings')
        .insert({
          user_id: user.id,
          order_id: orderId,
          user_type: userType,
          gross_amount: grossAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          net_amount: netAmount,
          status: 'available',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings', user?.id] });
    },
  });
}
