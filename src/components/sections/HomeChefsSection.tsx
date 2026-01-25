import { motion } from 'framer-motion';
import { ChefHat, Star, Clock, Heart, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFeaturedHomeChefs, useFeaturedHomeChefItems } from '@/hooks/useHomeChefs';
import { formatPKR } from '@/lib/currency';
import { useCart } from '@/context/CartContext';

// Fallback dummy data when no real HomeChefs exist
const fallbackHomeChefs = [
  {
    id: 'demo-1',
    name: 'Ammi Ki Rasoi',
    category: 'Authentic Biryani & Nihari',
    rating: 4.9,
    deliveryTime: '45-60 min',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    deliveryFee: 100,
    featured: true,
  },
  {
    id: 'demo-2',
    name: 'Dadi Ka Kitchen',
    category: 'Traditional Haleem & Korma',
    rating: 4.8,
    deliveryTime: '40-55 min',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
    deliveryFee: 80,
    featured: false,
  },
  {
    id: 'demo-3',
    name: 'Karachi Homemade',
    category: 'Seekh Kabab & Karahi',
    rating: 4.7,
    deliveryTime: '35-50 min',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
    deliveryFee: 60,
    featured: true,
  },
  {
    id: 'demo-4',
    name: 'Nani Ka Ghar',
    category: 'Paratha & Qeema',
    rating: 4.9,
    deliveryTime: '30-45 min',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    deliveryFee: 50,
    featured: false,
  },
];

const HomeChefsSection = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: realHomeChefs = [], isLoading: chefsLoading } = useFeaturedHomeChefs(4);
  const { data: featuredItems = [], isLoading: itemsLoading } = useFeaturedHomeChefItems(4);

  // Use real data if available, otherwise show fallback
  const homeChefs = realHomeChefs.length > 0 ? realHomeChefs : fallbackHomeChefs;
  const showDemoData = realHomeChefs.length === 0;

  const handleChefClick = (chefId: string) => {
    // If demo data, navigate to registration instead
    if (chefId.startsWith('demo-')) {
      navigate('/homechefs');
    } else {
      navigate(`/restaurant/${chefId}`);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
            >
              <ChefHat className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                HomeChefs
              </h2>
              <p className="text-muted-foreground">
                Authentic homemade meals from Karachi's best home kitchens
              </p>
            </div>
          </div>
          <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/homechefs')}>
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Featured Items Section (when available) */}
        {featuredItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Popular HomeChef Dishes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl overflow-hidden border border-border group hover:shadow-lg transition-all"
                >
                  <div 
                    className="relative h-28 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/restaurant/${item.restaurantId}`)}
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                      HomeChef
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{item.restaurant.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary text-sm">{formatPKR(item.price)}</span>
                      <Button
                        size="sm"
                        variant="cart"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(item);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Chefs Grid */}
        {chefsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeChefs.map((chef, index) => (
              <motion.div
                key={chef.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => handleChefClick(chef.id)}
                className="card-base overflow-hidden cursor-pointer group"
              >
                <div className="relative h-40 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    src={chef.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'}
                    alt={chef.name}
                    className="w-full h-full object-cover"
                  />
                  {showDemoData && (
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="font-semibold text-sm">{chef.rating || 4.5}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {chef.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{chef.category}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{chef.deliveryTime || '30-45 min'}</span>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                      {formatPKR(chef.deliveryFee || 50)} delivery
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* HomeChef registration is only available to restaurant owners - removed from customer view */}

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" onClick={() => navigate('/homechefs')}>
            View All HomeChefs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeChefsSection;
