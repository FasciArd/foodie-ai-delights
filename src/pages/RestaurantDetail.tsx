import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin, Heart, Share2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import MenuCard from '@/components/MenuCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import Footer from '@/components/Footer';
import ReviewSection from '@/components/ReviewSection';
import { useRestaurant, useMenuItems } from '@/hooks/useRestaurants';
import { formatPKR } from '@/lib/currency';
const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLiked, setIsLiked] = useState(false);

  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(id);
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems(id);

  // Get unique categories from menu items
  const menuCategories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => item.category));
    return ['all', ...Array.from(cats)];
  }, [menuItems]);

  // Filter menu items by category
  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Restaurant not found
          </h2>
          <p className="text-muted-foreground mb-6">
            The restaurant you're looking for doesn't exist
          </p>
          <Button onClick={() => navigate('/restaurants')}>
            Browse Restaurants
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-16 sm:pt-20">
      {/* Hero Image */}
      <section className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4"
        >
          <Button
            variant="icon"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 flex gap-2"
        >
          <Button
            variant="icon"
            size="icon"
            onClick={() => setIsLiked(!isLiked)}
            className={`bg-background/80 backdrop-blur-sm ${
              isLiked ? 'text-destructive' : ''
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="icon"
            size="icon"
            className="bg-background/80 backdrop-blur-sm"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">
              {restaurant.name}
            </h1>
            <p className="text-primary-foreground/80 text-lg mb-3">
              {restaurant.category}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/90">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{restaurant.distance}</span>
              </div>
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                {formatPKR(restaurant.deliveryFee || 0)} delivery
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tags */}
      <section className="py-4 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-4 border-b border-border/50 sticky top-16 sm:top-20 bg-background z-40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {menuCategories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm capitalize ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground border border-border hover:border-primary'
                }`}
              >
                {category === 'all' ? 'All Items' : category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="py-8 sm:py-12 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {filteredMenuItems.length > 0 ? (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4"
              >
                {filteredMenuItems.map((item, index) => (
                  <MenuCard key={item.id} item={item} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-5xl mb-4">🍳</div>
                <p className="text-muted-foreground">
                  No items in this category
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews */}
          {id && <ReviewSection restaurantId={id} />}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
