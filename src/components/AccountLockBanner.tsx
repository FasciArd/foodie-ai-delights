import { motion } from 'framer-motion';
import { AlertTriangle, Lock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccountLock } from '@/hooks/useAccountLock';
import { formatPKR } from '@/lib/currency';
import { useNavigate } from 'react-router-dom';

export default function AccountLockBanner() {
  const { data: accountStatus, isLoading } = useAccountLock();
  const navigate = useNavigate();

  if (isLoading || !accountStatus) return null;

  // Show warning if there are overdue bills (even if not locked yet)
  if (accountStatus.overdueTaxBills > 0 && !accountStatus.isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-600">Tax Payment Overdue</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You have {accountStatus.overdueTaxBills} overdue tax bill(s) totaling{' '}
              <span className="font-semibold">{formatPKR(accountStatus.totalOverdueAmount)}</span>.
              Please pay to avoid account restrictions.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-amber-500 text-amber-600 hover:bg-amber-500/10"
              onClick={() => navigate('/earnings')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              View Tax Bills
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show full lock screen if account is locked
  if (accountStatus.isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
      >
        <div className="max-w-md text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="w-12 h-12 text-destructive" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">Account Locked</h1>
          
          <p className="text-muted-foreground mb-6">
            Your account has been locked due to unpaid tax obligations.
            Please clear your dues to restore access.
          </p>

          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive">
              <strong>Outstanding Amount:</strong>{' '}
              {formatPKR(accountStatus.totalOverdueAmount)}
            </p>
            <p className="text-sm text-destructive mt-1">
              <strong>Overdue Bills:</strong> {accountStatus.overdueTaxBills}
            </p>
          </div>

          <Button onClick={() => navigate('/earnings')} className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            Pay Tax Bills
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Your account will be unlocked automatically once all overdue tax bills are paid.
          </p>
        </div>
      </motion.div>
    );
  }

  return null;
}
