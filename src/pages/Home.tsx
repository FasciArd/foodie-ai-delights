import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RestaurantCard from '@/components/RestaurantCard';
import AICarousel from '@/components/AICarousel';
import Footer from '@/components/Footer';
import HomeChefsSection from '@/components/sections/HomeChefsSection';
import ProMembershipBanner from '@/components/sections/ProMembershipBanner';
import { useFeaturedRestaurants, usePopularMenuItems } from '@/hooks/useRestaurants';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: featuredRestaurants = [] } = useFeaturedRestaurants();
  const { data: aiRecommendations = [] } = usePopularMenuItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Food Discovery</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Delicious Food,{' '}
              <span className="text-primary">Delivered Fast</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Discover amazing restaurants near you with AI-powered recommendations.
              Track your calories, find budget-friendly options, and enjoy seamless delivery.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="search-bar flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                <Button type="submit" variant="hero" className="shrink-0">
                  <Search className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </motion.form>

            {/* Quick Stats */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🍕</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">500+</p>
                  <p className="text-xs">Restaurants</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">30 min</p>
                  <p className="text-xs">Avg. Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-xl">⭐</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">4.8</p>
                  <p className="text-xs">App Rating</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* HomeChefs Section */}
      <HomeChefsSection />

      {/* AI Recommendations */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <AICarousel
            items={aiRecommendations}
            title="AI Picks For You"
            subtitle="Personalized based on your preferences"
          />
        </div>
      </section>

      {/* Pro Membership Banner */}
      <ProMembershipBanner />

      {/* Featured Restaurants */}
      <section className="py-12 sm:py-16 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Featured Restaurants
              </h2>
              <p className="text-muted-foreground">
                Top-rated spots handpicked for you
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/restaurants')}
              className="hidden sm:flex"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate('/restaurants')}>
              View All Restaurants
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary relative overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl"
        />
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4"
          >
            Hungry? Order Now!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto"
          >
            Browse hundreds of restaurants and get your favorite food delivered in minutes
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => navigate('/restaurants')}
            >
              Browse Restaurants
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate('/homechefs')}
            >
              Explore HomeChefs
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
