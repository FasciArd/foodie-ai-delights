import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
  index?: number;
}

const CartItem = ({ item, index = 0 }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const { menuItem, quantity } = item;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-base p-4 flex gap-4"
    >
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
        <img
          src={menuItem.image}
          alt={menuItem.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-semibold text-foreground truncate pr-2">
            {menuItem.name}
          </h4>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => removeItem(menuItem.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          {menuItem.calories * quantity} cal total
        </p>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-secondary rounded-full p-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => updateQuantity(menuItem.id, quantity - 1)}
              className="rounded-full"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => updateQuantity(menuItem.id, quantity + 1)}
              className="rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Price */}
          <span className="font-bold text-primary">
            ${(menuItem.price * quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
