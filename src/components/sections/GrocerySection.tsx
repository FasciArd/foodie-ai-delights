import { motion } from 'framer-motion';
import { ShoppingBasket, Clock, Zap, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const groceryCategories = [
  { id: 'fruits', name: 'Fruits & Vegetables', icon: '🥬', items: '500+ items' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', items: '200+ items' },
  { id: 'meat', name: 'Meat & Poultry', icon: '🍖', items: '150+ items' },
  { id: 'bakery', name: 'Bakery & Bread', icon: '🍞', items: '100+ items' },
  { id: 'snacks', name: 'Snacks & Chips', icon: '🍿', items: '300+ items' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', items: '250+ items' },
  { id: 'household', name: 'Household', icon: '🧹', items: '400+ items' },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊', items: '150+ items' },
];

const GrocerySection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center"
            >
              <ShoppingBasket className="w-6 h-6 text-green-600" />
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                pandamart
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  NEW
                </span>
              </h2>
              <p className="text-muted-foreground">
                Groceries delivered in under 25 minutes
              </p>
            </div>
          </div>
          <Button variant="outline" className="hidden sm:flex border-green-500 text-green-600 hover:bg-green-50" onClick={() => navigate('/grocery')}>
            Shop Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-4 text-center"
          >
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="font-bold text-foreground">Under 25 min</p>
            <p className="text-xs text-muted-foreground">Express Delivery</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-base p-4 text-center"
          >
            <Package className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-bold text-foreground">5000+ Items</p>
            <p className="text-xs text-muted-foreground">Wide Selection</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base p-4 text-center"
          >
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="font-bold text-foreground">24/7</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {groceryCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/grocery?category=${category.id}`)}
              className="card-base p-4 text-center cursor-pointer hover:border-green-500 transition-all"
            >
              <span className="text-4xl mb-2 block">{category.icon}</span>
              <p className="font-medium text-sm text-foreground">{category.name}</p>
              <p className="text-xs text-muted-foreground">{category.items}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" className="border-green-500 text-green-600" onClick={() => navigate('/grocery')}>
            Shop Groceries
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GrocerySection;
