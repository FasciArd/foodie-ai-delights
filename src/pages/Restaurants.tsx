import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RestaurantCard from '@/components/RestaurantCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import Footer from '@/components/Footer';
import { useRestaurants, useCategories } from '@/hooks/useRestaurants';
import { useRestaurantsByCategory } from '@/hooks/useRestaurantsByCategory';

const Restaurants = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'distance'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: allRestaurants = [], isLoading: isLoadingAll } = useRestaurants();
  const { data: categoryRestaurants = [], isLoading: isLoadingCategory } = useRestaurantsByCategory(selectedCategory);
  const { data: categories = [] } = useCategories();

  // Use category filtered data when category is selected
  const baseRestaurants = selectedCategory === 'all' ? allRestaurants : categoryRestaurants;
  const isLoading = selectedCategory === 'all' ? isLoadingAll : isLoadingCategory;

  // Update category from URL when it changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const filteredRestaurants = useMemo(() => {
    let result = [...baseRestaurants];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'deliveryTime':
        result.sort((a, b) => {
          const aTime = parseInt(a.deliveryTime?.split('-')[0] || '0');
          const bTime = parseInt(b.deliveryTime?.split('-')[0] || '0');
          return aTime - bTime;
        });
        break;
      case 'distance':
        result.sort((a, b) => {
          const aDist = parseFloat(a.distance || '0');
          const bDist = parseFloat(b.distance || '0');
          return aDist - bDist;
        });
        break;
    }

    return result;
  }, [baseRestaurants, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <section className="py-8 sm:py-12 bg-gradient-warm border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              All Restaurants
            </h1>
            <p className="text-muted-foreground">
              {filteredRestaurants.length} restaurants available
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="search-bar flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <Button
                variant="icon"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary text-primary-foreground' : ''}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4 border-b border-border/50 sticky top-16 sm:top-20 bg-background z-40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground border border-border hover:border-primary'
                }`}
              >
                <span>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="py-4 bg-card border-b border-border/50"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
              {[
                { value: 'rating', label: 'Top Rated' },
                { value: 'deliveryTime', label: 'Fastest' },
                { value: 'distance', label: 'Nearest' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'default' : 'pill'}
                  size="sm"
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Restaurant Grid */}
      <section className="py-8 sm:py-12 flex-1">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SkeletonLoader variant="card" count={8} />
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No restaurants found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Restaurants;
