import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, CreditCard, Smartphone, Gift, Loader2, Tag, Percent, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatPKR } from '@/lib/currency';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

interface Reward {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  minOrder: number;
  expiresAt: string;
  description: string;
}

const mockRewards: Reward[] = [
  { id: '1', code: 'WELCOME50', discount: 50, type: 'fixed', minOrder: 500, expiresAt: '2025-02-28', description: 'Welcome bonus for new users' },
  { id: '2', code: 'FOODIE20', discount: 20, type: 'percent', minOrder: 800, expiresAt: '2025-01-31', description: '20% off on orders above Rs. 800' },
  { id: '3', code: 'FREEDELIVERY', discount: 100, type: 'fixed', minOrder: 600, expiresAt: '2025-03-15', description: 'Free delivery on your next order' },
];

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [addingMoney, setAddingMoney] = useState(false);

  // Fetch wallet balance and transactions
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user?.id) return;
      
      setLoadingBalance(true);
      
      try {
        // Fetch balance from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('user_id', user.id)
          .single();
        
        setBalance(profile?.wallet_balance || 0);

        // Fetch transactions
        const { data: txData } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        
        setTransactions(txData || []);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoadingBalance(false);
      }
    };
    
    fetchWalletData();
  }, [user?.id]);

  const handleAddMoney = async () => {
    if (!user?.id || !addAmount) return;
    
    const amount = parseInt(addAmount);
    if (amount < 100) {
      toast.error('Minimum amount is Rs. 100');
      return;
    }

    setAddingMoney(true);

    try {
      // Calculate bonus for large top-ups
      let bonus = 0;
      if (amount >= 5000) bonus = 250;
      else if (amount >= 2000) bonus = 100;
      else if (amount >= 1000) bonus = 50;

      const totalCredit = amount + bonus;
      const newBalance = balance + totalCredit;

      // Update balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'credit',
          amount: totalCredit,
          description: bonus > 0 
            ? `Added via ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} (+Rs. ${bonus} bonus)`
            : `Added via ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`,
        });
      
      if (txError) throw txError;

      setBalance(newBalance);
      
      // Refresh transactions
      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setTransactions(txData || []);

      toast.success(
        bonus > 0 
          ? `Added ${formatPKR(totalCredit)} to your wallet (including Rs. ${bonus} bonus!)` 
          : `Added ${formatPKR(amount)} to your wallet`
      );
      
      setShowAddMoney(false);
      setAddAmount('');
    } catch (error: any) {
      console.error('Error adding money:', error);
      toast.error(error.message || 'Failed to add money');
    } finally {
      setAddingMoney(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copied to clipboard!`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access your wallet</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </motion.div>
      </div>
    );
  }

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <section className="py-8 bg-gradient-to-r from-primary via-orange-dark to-primary">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">FoodiePay</h1>
            <p className="text-white/80 mb-6">Your Digital Wallet</p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm mx-auto">
              <p className="text-white/80 text-sm mb-1">Available Balance</p>
              {loadingBalance ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <p className="text-4xl font-bold">{formatPKR(balance)}</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Actions */}
      <section className="py-6 -mt-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddMoney(true)}
              className="card-base p-4 text-center"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-foreground">Add Money</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.info('Send money feature coming soon!')}
              className="card-base p-4 text-center"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ArrowUpRight className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-medium text-foreground">Send</p>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRewards(true)}
              className="card-base p-4 text-center"
            >
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-medium text-foreground">Rewards</p>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Bonus Info */}
      <section className="py-4">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              Top-up Bonus
            </h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-muted-foreground">Rs. 1,000+ → <span className="text-green-600 font-medium">+Rs. 50</span></div>
              <div className="text-muted-foreground">Rs. 2,000+ → <span className="text-green-600 font-medium">+Rs. 100</span></div>
              <div className="text-muted-foreground">Rs. 5,000+ → <span className="text-green-600 font-medium">+Rs. 250</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction History */}
      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Add money to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => {
                const { date, time } = formatDate(tx.created_at);
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-base p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {tx.type === 'credit' ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description || (tx.type === 'credit' ? 'Added money' : 'Payment')}</p>
                        <p className="text-sm text-muted-foreground">{date} at {time}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatPKR(tx.amount)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Add Money Modal */}
      <Dialog open={showAddMoney} onOpenChange={setShowAddMoney}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Money to Wallet
            </DialogTitle>
            <DialogDescription>
              Choose amount and payment method
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Amount Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="pl-10 text-lg"
                />
              </div>
              {parseInt(addAmount) >= 1000 && (
                <p className="text-sm text-green-600 mt-1">
                  +Rs. {parseInt(addAmount) >= 5000 ? 250 : parseInt(addAmount) >= 2000 ? 100 : 50} bonus!
                </p>
              )}
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setAddAmount(amount.toString())}
                  className={addAmount === amount.toString() ? 'border-primary bg-primary/10' : ''}
                >
                  Rs. {amount}
                </Button>
              ))}
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Payment Method</label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                <label className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer ${
                  paymentMethod === 'jazzcash' ? 'border-primary bg-primary/5' : 'border-border'
                }`}>
                  <RadioGroupItem value="jazzcash" />
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">JazzCash</span>
                </label>
                
                <label className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer ${
                  paymentMethod === 'easypaisa' ? 'border-primary bg-primary/5' : 'border-border'
                }`}>
                  <RadioGroupItem value="easypaisa" />
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Easypaisa</span>
                </label>
                
                <label className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer ${
                  paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
                }`}>
                  <RadioGroupItem value="card" />
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <span className="font-medium">Debit/Credit Card</span>
                </label>
              </RadioGroup>
            </div>
          </div>

          <Button 
            variant="hero" 
            className="w-full" 
            disabled={!addAmount || parseInt(addAmount) < 100 || addingMoney}
            onClick={handleAddMoney}
          >
            {addingMoney ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Add ${addAmount ? formatPKR(parseInt(addAmount)) : 'Money'}`
            )}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Rewards Modal */}
      <Dialog open={showRewards} onOpenChange={setShowRewards}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Your Rewards
            </DialogTitle>
            <DialogDescription>
              Available coupons and discounts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {mockRewards.map((reward) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-dashed border-primary/50 rounded-xl p-4 bg-primary/5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {reward.type === 'percent' ? (
                      <Percent className="w-5 h-5 text-primary" />
                    ) : (
                      <Tag className="w-5 h-5 text-primary" />
                    )}
                    <span className="font-bold text-lg text-primary">
                      {reward.type === 'percent' ? `${reward.discount}% OFF` : `Rs. ${reward.discount} OFF`}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyCode(reward.code)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-foreground font-medium mb-1">{reward.code}</p>
                <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min order: Rs. {reward.minOrder}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default WalletPage;
