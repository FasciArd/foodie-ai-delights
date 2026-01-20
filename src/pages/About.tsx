import { motion } from 'framer-motion';
import { ArrowLeft, Users, Heart, Truck, Award, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const About = () => {
  const navigate = useNavigate();

  const values = [
    { icon: Heart, title: 'Customer First', description: 'We prioritize your satisfaction above all else.' },
    { icon: Truck, title: 'Fast Delivery', description: 'Hot food delivered to your doorstep in minutes.' },
    { icon: Award, title: 'Quality Food', description: 'Partner with only the best restaurants in Karachi.' },
    { icon: Users, title: 'Community', description: 'Building connections through food and culture.' },
  ];

  const stats = [
    { value: '500+', label: 'Restaurant Partners' },
    { value: '1M+', label: 'Happy Customers' },
    { value: '50K+', label: 'Daily Orders' },
    { value: '2000+', label: 'Delivery Riders' },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              About FoodieHub
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              FoodieHub is Karachi's leading food delivery platform, connecting food lovers 
              with their favorite restaurants, home chefs, and hidden gems across the city.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="flex items-center gap-2 text-primary mb-4">
                <Target className="w-5 h-5" />
                <span className="font-medium">Our Story</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                From Humble Beginnings to Karachi's Food Hub
              </h2>
              <p className="text-muted-foreground mb-4">
                Founded in 2020, FoodieHub started with a simple mission: make delicious food 
                accessible to everyone in Karachi. What began as a small team of food enthusiasts 
                has grown into the city's most trusted food delivery platform.
              </p>
              <p className="text-muted-foreground">
                Today, we partner with over 500 restaurants, from popular chains to beloved 
                local eateries and authentic home kitchens. Our network of dedicated delivery 
                riders ensures your food arrives hot and fresh, every single time.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                <Sparkles className="w-32 h-32 text-primary/50" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at FoodieHub
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-base p-6 text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
