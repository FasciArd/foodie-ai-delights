import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin } from 'lucide-react';
import { Restaurant } from '@/types';
import { formatPKR } from '@/lib/currency';

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

const RestaurantCard = forwardRef<HTMLDivElement, RestaurantCardProps>(
  ({ restaurant, index = 0 }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <Link to={`/restaurant/${restaurant.id}`}>
          <motion.div
            whileHover={{ y: -8, rotate: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="card-base overflow-hidden group cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Featured Badge */}
              {restaurant.featured && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold"
                >
                  Featured
                </motion.div>
              )}

              {/* Rating Badge */}
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="font-semibold text-sm">{restaurant.rating}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{restaurant.category}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {restaurant.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.distance}</span>
                </div>
                <span className="text-primary font-semibold">
                  {formatPKR(restaurant.deliveryFee)} delivery
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    );
  }
);

RestaurantCard.displayName = 'RestaurantCard';

export default RestaurantCard;
