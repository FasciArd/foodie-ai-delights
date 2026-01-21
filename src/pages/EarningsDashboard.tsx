import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, TrendingUp, ArrowDownToLine, Clock, CheckCircle, 
  DollarSign, FileText, History, AlertCircle, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useEarningsSummary, useWithdrawals } from '@/hooks/useEarnings';
import { formatPKR } from '@/lib/currency';
import { format } from 'date-fns';
import Footer from '@/components/Footer';
import WithdrawalModal from '@/components/WithdrawalModal';
import { useNavigate } from 'react-router-dom';

const COMMISSION_RATES = {
  restaurant: 0.10,
  homechef: 0.10,
  driver: 0.05,
};

const EarningsDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  
  const {
    totalGross,
    totalCommission,
    totalNet,
    availableBalance,
    pendingBalance,
    withdrawnBalance,
    earnings,
  } = useEarningsSummary();

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useWithdrawals();

  const commissionRate = userRole ? COMMISSION_RATES[userRole as keyof typeof COMMISSION_RATES] || 0.10 : 0.10;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (userRole !== 'restaurant' && userRole !== 'driver')) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Earnings Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            This dashboard is for restaurant owners and delivery partners
          </p>
          <Button onClick={() => navigate('/role-registration')}>
            Register as Partner
          </Button>
        </motion.div>
      </div>
    );
  }

  const statusColors = {
    pending: 'text-amber-500 bg-amber-500/10',
    processing: 'text-blue-500 bg-blue-500/10',
    completed: 'text-emerald-500 bg-emerald-500/10',
    rejected: 'text-destructive bg-destructive/10',
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Hero */}
      <section className="py-8 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Earnings Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Track your earnings, commissions, and withdraw your money
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Available Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Available Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{formatPKR(availableBalance)}</p>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => setWithdrawalModalOpen(true)}
                    disabled={availableBalance <= 0}
                  >
                    <ArrowDownToLine className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatPKR(pendingBalance)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Processing orders</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total Withdrawn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Withdrawn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatPKR(withdrawnBalance)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total payouts</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Commission Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Platform Commission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl sm:text-3xl font-bold text-destructive">{(commissionRate * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Deducted from earnings</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-6 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs defaultValue="earnings">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="earnings" className="flex-1">
                <TrendingUp className="w-4 h-4 mr-2" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="flex-1">
                <History className="w-4 h-4 mr-2" />
                Withdrawals
              </TabsTrigger>
            </TabsList>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="mt-6">
              {earnings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No earnings yet</h3>
                  <p className="text-muted-foreground">
                    Complete orders to start earning
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Gross</p>
                        <p className="text-lg font-bold">{formatPKR(totalGross)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="text-lg font-bold text-destructive">-{formatPKR(totalCommission)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Net Earnings</p>
                        <p className="text-lg font-bold text-primary">{formatPKR(totalNet)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Earnings List */}
                  <div className="space-y-3">
                    {earnings.map((earning) => (
                      <motion.div
                        key={earning.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{earning.order_id?.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(earning.created_at), 'PPP')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatPKR(earning.net_amount)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                              earning.status === 'available' ? 'bg-emerald-500/10 text-emerald-500' :
                              earning.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {earning.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border flex justify-between text-sm text-muted-foreground">
                          <span>Gross: {formatPKR(earning.gross_amount)}</span>
                          <span className="text-destructive">Commission: -{formatPKR(earning.commission_amount)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Withdrawals Tab */}
            <TabsContent value="withdrawals" className="mt-6">
              {withdrawalsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">💸</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No withdrawals yet</h3>
                  <p className="text-muted-foreground">
                    Withdraw your available balance to see history
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => (
                    <motion.div
                      key={withdrawal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{formatPKR(withdrawal.amount)}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {withdrawal.method} • {withdrawal.account_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[withdrawal.status]}`}>
                            {withdrawal.status}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(withdrawal.created_at), 'PPP')}
                          </p>
                        </div>
                      </div>
                      {withdrawal.transaction_ref && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Ref: {withdrawal.transaction_ref}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />

      {/* Withdrawal Modal */}
      <WithdrawalModal
        open={withdrawalModalOpen}
        onOpenChange={setWithdrawalModalOpen}
        availableBalance={availableBalance}
        earnings={earnings}
        commissionRate={commissionRate}
      />
    </div>
  );
};

export default EarningsDashboard;
