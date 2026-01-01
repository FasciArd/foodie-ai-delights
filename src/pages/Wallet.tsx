import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, CreditCard, Smartphone, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatPKR } from '@/lib/currency';
import Footer from '@/components/Footer';

const transactions = [
  { id: '1', type: 'credit', amount: 500, description: 'Added via JazzCash', date: '2024-01-15', time: '14:30' },
  { id: '2', type: 'debit', amount: 350, description: 'Order #ORD-001', date: '2024-01-14', time: '19:45' },
  { id: '3', type: 'credit', amount: 100, description: 'Refund - Order cancelled', date: '2024-01-13', time: '11:20' },
  { id: '4', type: 'credit', amount: 200, description: 'Promo cashback', date: '2024-01-12', time: '09:15' },
  { id: '5', type: 'debit', amount: 720, description: 'Order #ORD-002', date: '2024-01-10', time: '20:30' },
];

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance] = useState(1450);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');

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
              <p className="text-4xl font-bold">{formatPKR(balance)}</p>
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

      {/* Transaction History */}
      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Transaction History</h2>
          </div>

          <div className="space-y-3">
            {transactions.map((tx, index) => (
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
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{tx.date} at {tx.time}</p>
                  </div>
                </div>
                <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatPKR(tx.amount)}
                </span>
              </motion.div>
            ))}
          </div>
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
            disabled={!addAmount || parseInt(addAmount) < 100}
          >
            Add {addAmount ? formatPKR(parseInt(addAmount)) : 'Money'}
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default WalletPage;
