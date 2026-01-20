import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Truck, MapPin, Phone, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPKR } from '@/lib/currency';

// Extended payment method type to include wallet
type PaymentMethodType = 'cod' | 'easypaisa' | 'jazzcash' | 'stripe' | 'wallet';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalCalories, clearCart } = useCart();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const deliveryFee = 100;
  const serviceFee = 50;
  const finalTotal = totalPrice + deliveryFee + serviceFee;
  const hasEnoughBalance = walletBalance >= finalTotal;

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('user_id', user.id)
        .single();
      
      setWalletBalance(data?.wallet_balance || 0);
    };
    
    fetchWalletBalance();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check wallet balance if paying with wallet
    if (paymentMethod === 'wallet' && !hasEnoughBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderItems = items.map(item => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        calories: item.menuItem.calories,
      }));

      // Get restaurant_id from the first item if available
      const restaurantId = items[0]?.menuItem.restaurantId || null;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          items: orderItems,
          total_price: finalTotal,
          total_calories: totalCalories,
          delivery_address: formData.address,
          notes: formData.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Handle wallet payment - deduct from balance
      if (paymentMethod === 'wallet') {
        const newBalance = walletBalance - finalTotal;
        
        // Update wallet balance
        const { error: walletError } = await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('user_id', user.id);
        
        if (walletError) throw walletError;

        // Create wallet transaction record
        await supabase
          .from('wallet_transactions')
          .insert({
            user_id: user.id,
            type: 'debit',
            amount: finalTotal,
            description: `Order #${order.id.slice(0, 8).toUpperCase()}`,
          });
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          amount: finalTotal,
          method: paymentMethod === 'wallet' ? 'cod' : paymentMethod, // Map wallet to cod for DB enum
          status: paymentMethod === 'wallet' ? 'completed' : 'pending',
        });

      if (paymentError) throw paymentError;

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to your cart first</p>
          <Button onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-8">
      {/* Header */}
      <section className="py-6 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
              <p className="text-muted-foreground">{items.length} items</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-base p-6"
                >
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Delivery Details
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="03XX-XXXXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        placeholder="Complete delivery address with landmarks"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="pl-10 min-h-[80px]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or delivery instructions"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card-base p-6"
                >
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </h2>
                  
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethodType)}
                    className="space-y-3"
                  >
                    {/* My Wallet - First Option */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'wallet' 
                        ? 'border-primary bg-primary/5' 
                        : !hasEnoughBalance 
                          ? 'border-border opacity-60 cursor-not-allowed' 
                          : 'border-border hover:border-primary/50'
                    }`}>
                      <RadioGroupItem value="wallet" id="wallet" disabled={!hasEnoughBalance} />
                      <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">My Wallet (FoodiePay)</p>
                          <span className={`text-sm font-semibold ${hasEnoughBalance ? 'text-green-600' : 'text-destructive'}`}>
                            {formatPKR(walletBalance)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {hasEnoughBalance 
                            ? 'Pay instantly with your wallet balance' 
                            : 'Insufficient balance - Add money to use'}
                        </p>
                      </div>
                    </label>
                    
                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Banknote className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </label>
                    
                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'easypaisa' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                      <RadioGroupItem value="easypaisa" id="easypaisa" />
                      <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Easypaisa</p>
                        <p className="text-sm text-muted-foreground">Pay via Easypaisa mobile wallet</p>
                      </div>
                    </label>
                    
                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'jazzcash' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                      <RadioGroupItem value="jazzcash" id="jazzcash" />
                      <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">JazzCash</p>
                        <p className="text-sm text-muted-foreground">Pay via JazzCash mobile wallet</p>
                      </div>
                    </label>
                    
                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}>
                      <RadioGroupItem value="stripe" id="stripe" />
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard accepted</p>
                      </div>
                    </label>
                  </RadioGroup>
                </motion.div>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card-base p-6 sticky top-24"
                >
                  <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>
                  
                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.menuItem.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="font-medium">Rs. {(item.menuItem.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>Rs. {totalPrice.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>Rs. {deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service Fee</span>
                      <span>Rs. {serviceFee}</span>
                    </div>
                    {paymentMethod === 'wallet' && hasEnoughBalance && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Wallet Payment</span>
                        <span>-{formatPKR(finalTotal)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">Rs. {finalTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full mt-6"
                    disabled={loading || (paymentMethod === 'wallet' && !hasEnoughBalance)}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    By placing this order, you agree to our terms of service
                  </p>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
