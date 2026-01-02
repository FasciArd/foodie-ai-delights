import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatPKR } from '@/lib/currency';
import { MenuItem } from '@/types';

interface CheaperAlternativeProps {
  currentItem: MenuItem;
  onSelect: (item: MenuItem) => void;
}

interface Alternative {
  id: string;
  name: string;
  price: number;
  restaurant_id: string;
  restaurant_name: string;
  savings: number;
  image: string | null;
}

const CheaperAlternative = ({ currentItem, onSelect }: CheaperAlternativeProps) => {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const findAlternatives = async () => {
      if (!currentItem.name || currentItem.price < 200) return;

      setLoading(true);
      try {
        // Search for similar items with lower price
        const keywords = currentItem.name.toLowerCase().split(' ').filter(w => w.length > 3);
        
        const { data: items } = await supabase
          .from('menu_items')
          .select(`
            id, 
            name, 
            price, 
            image,
            restaurant_id,
            restaurants!inner(name)
          `)
          .eq('is_available', true)
          .lt('price', currentItem.price * 0.8) // At least 20% cheaper
          .order('price', { ascending: true })
          .limit(5);

        if (items && items.length > 0) {
          // Filter for similar items
          const similar = items.filter(item => {
            const itemName = item.name.toLowerCase();
            return keywords.some(keyword => itemName.includes(keyword));
          });

          if (similar.length > 0) {
            const mapped = similar.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              restaurant_id: item.restaurant_id,
              restaurant_name: (item.restaurants as any)?.name || 'Unknown',
              savings: currentItem.price - item.price,
              image: item.image,
            }));
            setAlternatives(mapped);
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error('Error finding alternatives:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(findAlternatives, 1000);
    return () => clearTimeout(debounce);
  }, [currentItem]);

  if (alternatives.length === 0 || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-gradient-to-r from-emerald-500/10 to-primary/10 rounded-xl p-4 border border-emerald-500/20"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span className="font-medium text-foreground">Budget-Friendly Options</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          Similar items at better prices:
        </p>

        <div className="space-y-2">
          {alternatives.slice(0, 3).map((alt) => (
            <button
              key={alt.id}
              onClick={() => {
                onSelect({
                  id: alt.id,
                  name: alt.name,
                  price: alt.price,
                  restaurantId: alt.restaurant_id,
                  image: alt.image,
                  category: '',
                  calories: null,
                  description: null,
                });
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-muted transition-colors text-left"
            >
              {alt.image && (
                <img src={alt.image} alt={alt.name} className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{alt.name}</p>
                <p className="text-xs text-muted-foreground">{alt.restaurant_name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-500">{formatPKR(alt.price)}</p>
                <p className="text-xs text-emerald-600">Save {formatPKR(alt.savings)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheaperAlternative;
