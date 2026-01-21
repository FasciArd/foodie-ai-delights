import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addDays } from 'date-fns';

export interface TaxBill {
  id: string;
  user_id: string;
  withdrawal_id: string | null;
  user_type: string;
  total_earnings: number;
  withdrawn_amount: number;
  tax_rate: number;
  tax_amount: number;
  net_payout: number;
  period_start: string;
  period_end: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useTaxBills() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tax-bills', user?.id],
    queryFn: async (): Promise<TaxBill[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('tax_bills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as TaxBill[];
    },
    enabled: !!user,
  });
}

export function useCreateTaxBill() {
  const queryClient = useQueryClient();
  const { user, userRole } = useAuth();

  return useMutation({
    mutationFn: async ({
      withdrawalId,
      totalEarnings,
      withdrawnAmount,
      periodStart,
      periodEnd,
    }: {
      withdrawalId?: string;
      totalEarnings: number;
      withdrawnAmount: number;
      periodStart: string;
      periodEnd: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const userType = userRole || 'restaurant';
      const taxRate = userType === 'driver' ? 0.05 : 0.10;
      const taxAmount = withdrawnAmount * taxRate;
      const netPayout = withdrawnAmount - taxAmount;
      const dueDate = addDays(new Date(), 30).toISOString();

      const { data, error } = await supabase
        .from('tax_bills')
        .insert({
          user_id: user.id,
          withdrawal_id: withdrawalId || null,
          user_type: userType,
          total_earnings: totalEarnings,
          withdrawn_amount: withdrawnAmount,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          net_payout: netPayout,
          period_start: periodStart,
          period_end: periodEnd,
          due_date: dueDate,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-bills', user?.id] });
    },
  });
}

export function useMarkTaxPaid() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (taxBillId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('tax_bills')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', taxBillId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-bills', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['account-lock', user?.id] });
    },
  });
}
