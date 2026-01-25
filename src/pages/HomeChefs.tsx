import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Star, Clock, Heart, Search, MapPin, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useHomeChefs, useFeaturedHomeChefItems } from '@/hooks/useHomeChefs';
import { formatPKR } from '@/lib/currency';
import { useCart } from '@/context/CartContext';

const HomeChefs = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const { data: homeChefs = [], isLoading: chefsLoading } = useHomeChefs();
  const { data: featuredItems = [], isLoading: itemsLoading } = useFeaturedHomeChefItems(6);
  const { addItem } = useCart();

  const areas = ['all', 'Gulshan-e-Iqbal', 'DHA Phase 6', 'Clifton', 'North Nazimabad', 'PECHS', 'Korangi'];

  const filteredChefs = homeChefs.filter(chef => {
    const matchesSearch = chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chef.category.toLowerCase().includes(searchQuery.toLowerCase());
    // For now, we don't have area in DB, so skip area filter if chef doesn't have it
    return matchesSearch;
  });

  return (
    <div ref={ref} className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <ChefHat className="w-5 h-5" />
              <span className="font-medium">HomeChefs</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Authentic Homemade Meals from Karachi's Best Home Kitchens
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Experience the taste of home with freshly prepared meals made by passionate home cooks
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search home chefs or dishes..."
                className="pl-12 pr-4 py-6 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Items Section - Clickable & Orderable */}
      {featuredItems.length > 0 && (
        <section className="py-8 bg-gradient-warm">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Featured HomeChef Dishes</h2>
                <p className="text-muted-foreground">Popular items you can order right now</p>
              </div>
            </div>

            {itemsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl overflow-hidden border border-border group hover:shadow-lg transition-all"
                  >
                    <Link to={`/restaurant/${item.restaurantId}`}>
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                          HomeChef
                        </div>
                      </div>
                    </Link>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{item.restaurant.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary text-sm">{formatPKR(item.price)}</span>
                        <Button
                          size="sm"
                          variant="cart"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(item);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="py-4 border-b border-border/50 sticky top-16 z-40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {areas.map((area) => (
              <Button
                key={area}
                variant={selectedArea === area ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedArea(area)}
                className="whitespace-nowrap rounded-full"
              >
                {area === 'all' ? 'All Areas' : area}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Chefs Grid */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              {filteredChefs.length} home chef{filteredChefs.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {chefsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredChefs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-foreground mb-2">No home chefs found</h3>
              <p className="text-muted-foreground mb-4">
                {homeChefs.length === 0 
                  ? "HomeChefs coming soon to your area!"
                  : "Try adjusting your search or filters"}
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedArea('all'); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChefs.map((chef, index) => (
                <motion.div
                  key={chef.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="card-base overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/restaurant/${chef.id}`)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      src={chef.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'}
                      alt={chef.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <ChefHat className="w-3 h-3" />
                      HomeChef
                    </div>
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span className="font-semibold text-sm">{chef.rating || '4.5'}</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {chef.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{chef.category}</p>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {chef.description || 'Authentic homemade dishes prepared with love'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{chef.deliveryTime || '30-45 min'}</span>
                      </div>
                      <span className="text-primary font-semibold">
                        {formatPKR(chef.deliveryFee || 50)} delivery
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button size="sm" className="w-full" variant="outline">
                        View Menu & Order
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
});

HomeChefs.displayName = 'HomeChefs';

export default HomeChefs;
