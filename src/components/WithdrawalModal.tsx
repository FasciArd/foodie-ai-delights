import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, Smartphone, Building, Loader2, CheckCircle, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatPKR } from '@/lib/currency';
import { useCreateWithdrawal, type Earning } from '@/hooks/useEarnings';
import { useCreateTaxBill } from '@/hooks/useTaxBills';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
  earnings: Earning[];
  commissionRate: number;
}

export default function WithdrawalModal({
  open,
  onOpenChange,
  availableBalance,
  earnings,
  commissionRate,
}: WithdrawalModalProps) {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const createWithdrawal = useCreateWithdrawal();
  const createTaxBill = useCreateTaxBill();
  
  const [step, setStep] = useState<'form' | 'bill' | 'success'>('form');
  const [method, setMethod] = useState<'easypaisa' | 'jazzcash' | 'bank'>('easypaisa');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState(availableBalance.toString());

  const withdrawAmount = parseFloat(amount) || 0;
  const isValidAmount = withdrawAmount > 0 && withdrawAmount <= availableBalance;

  // Calculate bill details
  const availableEarnings = earnings.filter(e => e.status === 'available');
  const totalGross = availableEarnings.reduce((sum, e) => sum + e.gross_amount, 0);
  const totalCommission = availableEarnings.reduce((sum, e) => sum + e.commission_amount, 0);
  const totalNet = availableEarnings.reduce((sum, e) => sum + e.net_amount, 0);

  // Tax calculation
  const taxRate = userRole === 'driver' ? 0.05 : 0.10;
  const taxAmount = withdrawAmount * taxRate;
  const netAfterTax = withdrawAmount - taxAmount;

  const handleGenerateBill = () => {
    if (!accountNumber) {
      toast({ title: 'Error', description: 'Please enter account number', variant: 'destructive' });
      return;
    }
    if (!isValidAmount) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    setStep('bill');
  };

  const handleConfirmWithdrawal = async () => {
    try {
      // Create withdrawal
      const withdrawal = await createWithdrawal.mutateAsync({
        amount: withdrawAmount,
        method,
        accountNumber,
      });

      // Create tax bill for this withdrawal
      await createTaxBill.mutateAsync({
        withdrawalId: withdrawal.id,
        totalEarnings: totalNet,
        withdrawnAmount: withdrawAmount,
        periodStart: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        periodEnd: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      });

      setStep('success');
      toast({ title: 'Success!', description: 'Withdrawal request submitted. Tax bill generated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setStep('form');
    setAccountNumber('');
    setAmount(availableBalance.toString());
    onOpenChange(false);
  };

  const methodLabels = {
    easypaisa: 'EasyPaisa',
    jazzcash: 'JazzCash',
    bank: 'Bank Account',
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            {step === 'form' && 'Withdraw Earnings'}
            {step === 'bill' && 'Withdrawal Bill'}
            {step === 'success' && 'Withdrawal Successful'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Available Balance */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-primary">{formatPKR(availableBalance)}</p>
            </div>

            {/* Withdrawal Method */}
            <div className="space-y-3">
              <Label>Withdrawal Method</Label>
              <RadioGroup value={method} onValueChange={(v) => setMethod(v as any)}>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'easypaisa', icon: Smartphone, label: 'EasyPaisa' },
                    { value: 'jazzcash', icon: CreditCard, label: 'JazzCash' },
                    { value: 'bank', icon: Building, label: 'Bank' },
                  ].map(({ value, icon: Icon, label }) => (
                    <label
                      key={value}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        method === value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value={value} className="sr-only" />
                      <Icon className={`w-6 h-6 mb-1 ${method === value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label>
                {method === 'bank' ? 'Bank Account Number' : `${methodLabels[method]} Number`}
              </Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={method === 'bank' ? 'Enter account number' : '03XX-XXXXXXX'}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount to Withdraw</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                max={availableBalance}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {formatPKR(availableBalance)}
              </p>
            </div>

            <Button
              onClick={handleGenerateBill}
              className="w-full"
              disabled={!isValidAmount || !accountNumber}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Bill
            </Button>
          </motion.div>
        )}

        {step === 'bill' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Bill Header */}
            <div className="text-center pb-4 border-b border-dashed border-border">
              <h3 className="font-bold text-lg">Earnings Withdrawal Bill</h3>
              <p className="text-sm text-muted-foreground">{format(new Date(), 'PPP')}</p>
            </div>

            {/* Order-wise Earnings */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase">Earnings Breakdown</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {availableEarnings.slice(0, 10).map((earning) => (
                  <div key={earning.id} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {earning.order_id?.slice(0, 8)}...
                      </span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(earning.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <span className="font-semibold">{formatPKR(earning.net_amount)}</span>
                  </div>
                ))}
                {availableEarnings.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{availableEarnings.length - 10} more orders
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gross Earnings</span>
                <span>{formatPKR(totalGross)}</span>
              </div>
              <div className="flex justify-between text-sm text-destructive">
                <span>Platform Commission ({(commissionRate * 100).toFixed(0)}%)</span>
                <span>-{formatPKR(totalCommission)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Withdrawal Amount</span>
                <span>{formatPKR(withdrawAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-amber-600">
                <span>Tax ({(taxRate * 100).toFixed(0)}%) - Due within 30 days</span>
                <span>-{formatPKR(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-dashed">
                <span>Net After Tax</span>
                <span className="text-primary">{formatPKR(netAfterTax)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{methodLabels[method]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account</span>
                <span className="font-mono">{accountNumber}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('form')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleConfirmWithdrawal}
                className="flex-1"
                disabled={createWithdrawal.isPending}
              >
                {createWithdrawal.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Confirm Withdrawal
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Withdrawal Submitted!</h3>
            <p className="text-muted-foreground">
              Your withdrawal request of {formatPKR(withdrawAmount)} has been submitted.
              It will be processed within 24-48 hours.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
