import { motion } from 'framer-motion';
import { Crown, Check, Truck, Percent, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProMembershipBanner = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: Truck, text: 'Free Delivery on Rs. 599+' },
    { icon: Percent, text: 'Up to 50% off on Pro restaurants' },
    { icon: Gift, text: 'Exclusive monthly rewards' },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-primary to-orange-dark p-8 sm:p-12"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-10 h-10 text-yellow-300" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  FoodiePro
                </h2>
              </div>
              
              <p className="text-white/90 text-lg mb-6 max-w-md">
                Get unlimited free delivery, exclusive discounts, and premium perks for just Rs. 299/month
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
                  >
                    <benefit.icon className="w-4 h-4 text-yellow-300" />
                    <span className="text-white text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <p className="text-white/80 text-sm mb-1">Starting at</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">Rs. 299</span>
                  <span className="text-white/80">/month</span>
                </div>
                <p className="text-yellow-300 text-sm mt-2">Save Rs. 500+ per month!</p>
              </div>
              
              <Button 
                size="lg"
                onClick={() => navigate('/pro-membership')}
                className="bg-white text-primary hover:bg-white/90 font-bold px-8"
              >
                Join Pro Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProMembershipBanner;
