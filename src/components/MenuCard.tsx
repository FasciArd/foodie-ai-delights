import { motion } from 'framer-motion';
import { Plus, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/currency';

interface MenuCardProps {
  item: MenuItem;
  index?: number;
}

const MenuCard = ({ item, index = 0 }: MenuCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="card-base overflow-hidden group"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {item.popular && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Popular
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <span className="font-bold text-lg text-primary">
                {formatPKR(item.price)}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {item.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-secondary px-2 py-1 rounded-md">
                {item.calories} cal
              </span>
              <span className="bg-secondary px-2 py-1 rounded-md">
                {item.category}
              </span>
            </div>
            
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="cart"
                size="icon"
                onClick={() => addItem(item)}
                className="shrink-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
