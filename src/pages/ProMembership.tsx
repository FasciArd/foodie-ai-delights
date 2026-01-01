import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Truck, Percent, Gift, Star, Utensils, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatPKR } from '@/lib/currency';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 299,
    period: 'month',
    savings: null,
    popular: false,
  },
  {
    id: 'quarterly',
    name: '3 Months',
    price: 749,
    period: '3 months',
    savings: 'Save Rs. 148',
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 2499,
    period: 'year',
    savings: 'Save Rs. 1,089',
    popular: false,
  },
];

const benefits = [
  { icon: Truck, title: 'Free Delivery', description: 'On orders above Rs. 599 from Pro restaurants' },
  { icon: Percent, title: 'Up to 50% Off', description: 'Exclusive discounts on Pro-marked restaurants' },
  { icon: Utensils, title: 'Dine-in Discounts', description: '30% off on bills at partner restaurants' },
  { icon: Gift, title: 'Monthly Rewards', description: 'Special vouchers and cashback offers' },
  { icon: Star, title: 'Priority Support', description: 'Skip the queue with dedicated support' },
];

const proRestaurants = [
  { name: 'Student Biryani', discount: '30% off', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200' },
  { name: 'Karachi Broast', discount: '25% off', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200' },
  { name: 'Kolachi', discount: '20% off', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200' },
  { name: 'BBQ Tonight', discount: '35% off', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200' },
];

const ProMembershipPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('quarterly');

  const handleSubscribe = () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/auth');
      return;
    }
    toast.success('Redirecting to payment...');
    // Handle payment flow
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-600 via-primary to-orange-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6"
            >
              <Crown className="w-10 h-10 text-yellow-300" />
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Upgrade to FoodiePro
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Unlock unlimited free delivery, exclusive discounts, and premium benefits
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`card-base p-6 cursor-pointer transition-all relative ${
                  selectedPlan === plan.id 
                    ? 'border-2 border-primary shadow-glow' 
                    : 'border border-border hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="font-bold text-lg text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-3xl font-bold text-primary">{formatPKR(plan.price)}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <span className="text-sm text-green-600 font-medium">{plan.savings}</span>
                  )}
                </div>
                
                {selectedPlan === plan.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="hero" size="lg" onClick={handleSubscribe}>
              Subscribe Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
            Pro Member Benefits
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-base p-6 text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Restaurants */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
            Pro Restaurants
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Exclusive discounts at 500+ partner restaurants in Karachi
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {proRestaurants.map((restaurant, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="card-base overflow-hidden"
              >
                <div className="relative h-24">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                    {restaurant.discount}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm text-foreground truncate">{restaurant.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProMembershipPage;
