import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEarningsSummary } from './useEarnings';

export interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  withdrawnBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  taxPaid: number;
}

/**
 * Single source of truth for wallet balance
 * Syncs earnings from earnings table with available balance
 */
export function useWalletBalance(): WalletData & { isLoading: boolean; refetch: () => void } {
  const { user } = useAuth();
  const earningsSummary = useEarningsSummary();

  const { data: taxData, isLoading: taxLoading, refetch: refetchTax } = useQuery({
    queryKey: ['tax-paid', user?.id],
    queryFn: async () => {
      if (!user) return { taxPaid: 0, totalWithdrawn: 0 };

      // Get total tax from paid tax bills
      const { data: taxBills } = await supabase
        .from('tax_bills')
        .select('tax_amount, withdrawn_amount')
        .eq('user_id', user.id)
        .eq('status', 'paid');

      const taxPaid = (taxBills || []).reduce((sum, bill) => sum + Number(bill.tax_amount), 0);
      const totalWithdrawn = (taxBills || []).reduce((sum, bill) => sum + Number(bill.withdrawn_amount), 0);

      return { taxPaid, totalWithdrawn };
    },
    enabled: !!user,
  });

  const refetch = () => {
    refetchTax();
  };

  return {
    availableBalance: earningsSummary.availableBalance,
    pendingBalance: earningsSummary.pendingBalance,
    withdrawnBalance: earningsSummary.withdrawnBalance,
    totalEarned: earningsSummary.totalNet,
    totalWithdrawn: taxData?.totalWithdrawn || 0,
    taxPaid: taxData?.taxPaid || 0,
    isLoading: taxLoading,
    refetch,
  };
}
