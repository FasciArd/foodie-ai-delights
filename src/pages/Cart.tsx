import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CartItem from '@/components/CartItem';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { menuItems } from '@/data/mockData';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { items, clearCart, totalPrice, totalCalories, totalItems } = useCart();

  const deliveryFee = 2.99;
  const serviceFee = 1.49;
  const finalTotal = totalPrice + deliveryFee + serviceFee;

  // Budget suggestions - items cheaper than average cart item price
  const avgItemPrice = totalItems > 0 ? totalPrice / totalItems : 15;
  const budgetSuggestions = menuItems
    .filter((item) => item.price < avgItemPrice && !items.some((i) => i.menuItem.id === item.id))
    .slice(0, 3);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    toast.success('Proceeding to checkout...');
    // In a real app, navigate to checkout
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <section className="py-6 sm:py-8 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Your Cart
              </h1>
              <p className="text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                variant="ghost"
                onClick={clearCart}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl mb-6"
              >
                🛒
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. 
                Discover delicious food from our restaurants!
              </p>
              <Button variant="hero" onClick={() => navigate('/restaurants')}>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Restaurants
              </Button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <CartItem key={item.menuItem.id} item={item} index={index} />
                  ))}
                </AnimatePresence>

                {/* Budget Suggestions */}
                {budgetSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-foreground">
                        Budget-Friendly Suggestions
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {budgetSuggestions.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          className="card-base p-3 flex items-center gap-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-primary font-bold text-sm">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card-base p-6 sticky top-24"
                >
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Order Summary
                  </h3>

                  {/* Calorie Counter */}
                  <div className="bg-secondary rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">
                        Calorie Counter
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {totalCalories}
                      </span>
                      <span className="text-muted-foreground">calories</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on selected items
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service Fee</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Secure payment powered by Stripe
                  </p>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cart;
