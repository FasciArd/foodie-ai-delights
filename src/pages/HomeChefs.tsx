import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Star, Clock, Heart, Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const allHomeChefs = [
  {
    id: '1',
    name: 'Ammi Ki Rasoi',
    specialty: 'Authentic Biryani & Nihari',
    rating: 4.9,
    reviews: 234,
    deliveryTime: '45-60 min',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    featured: true,
    area: 'Gulshan-e-Iqbal',
    description: 'Traditional family recipes passed down through generations',
  },
  {
    id: '2',
    name: 'Dadi Ka Kitchen',
    specialty: 'Traditional Haleem & Korma',
    rating: 4.8,
    reviews: 189,
    deliveryTime: '40-55 min',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
    featured: false,
    area: 'DHA Phase 6',
    description: 'Slow-cooked dishes made with love and patience',
  },
  {
    id: '3',
    name: 'Karachi Homemade',
    specialty: 'Seekh Kabab & Karahi',
    rating: 4.7,
    reviews: 156,
    deliveryTime: '35-50 min',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
    featured: true,
    area: 'Clifton',
    description: 'Fresh grilled delicacies from our home kitchen',
  },
  {
    id: '4',
    name: 'Nani Ka Ghar',
    specialty: 'Paratha & Qeema',
    rating: 4.9,
    reviews: 312,
    deliveryTime: '30-45 min',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    featured: false,
    area: 'North Nazimabad',
    description: 'Authentic breakfast and nashta items',
  },
  {
    id: '5',
    name: 'Bibi Ki Dastarkhan',
    specialty: 'Pulao & Qorma',
    rating: 4.6,
    reviews: 98,
    deliveryTime: '50-65 min',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    featured: false,
    area: 'PECHS',
    description: 'Royal Mughlai cuisine with authentic taste',
  },
  {
    id: '6',
    name: 'Mama Ji Foods',
    specialty: 'Chicken Karahi & Biryani',
    rating: 4.8,
    reviews: 267,
    deliveryTime: '40-55 min',
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400',
    featured: true,
    area: 'Korangi',
    description: 'Spicy and flavorful homemade dishes',
  },
];

const HomeChefs = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const areas = ['all', 'Gulshan-e-Iqbal', 'DHA Phase 6', 'Clifton', 'North Nazimabad', 'PECHS', 'Korangi'];

  const filteredChefs = allHomeChefs.filter(chef => {
    const matchesSearch = chef.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chef.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || chef.area === selectedArea;
    return matchesSearch && matchesArea;
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

          {filteredChefs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-bold text-foreground mb-2">No home chefs found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
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
                >
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      src={chef.image}
                      alt={chef.name}
                      className="w-full h-full object-cover"
                    />
                    {chef.featured && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        Featured
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span className="font-semibold text-sm">{chef.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {chef.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{chef.specialty}</p>
                    <p className="text-xs text-muted-foreground mb-4">{chef.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{chef.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{chef.area}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                        {chef.reviews} reviews
                      </span>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/homechef/${chef.id}`)}>
                        View Menu
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
