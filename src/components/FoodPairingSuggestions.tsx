import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatPKR } from '@/lib/currency';
import { MenuItem } from '@/types';

interface FoodPairingSuggestionsProps {
  currentItem: MenuItem;
  restaurantId: string;
  onAddItem: (item: MenuItem) => void;
}

const PAIRING_RULES: Record<string, string[]> = {
  'biryani': ['Raita', 'Drink', 'Salad', 'Lassi'],
  'burger': ['Fries', 'Drink', 'Shake', 'Cola'],
  'pizza': ['Drink', 'Fries', 'Garlic Bread', 'Wings'],
  'karahi': ['Naan', 'Roti', 'Raita', 'Drink'],
  'nihari': ['Naan', 'Roti', 'Lassi'],
  'kebab': ['Naan', 'Raita', 'Drink', 'Chutney'],
  'tikka': ['Naan', 'Raita', 'Drink'],
  'paratha': ['Chai', 'Lassi', 'Dahi'],
};

const FoodPairingSuggestions = ({ currentItem, restaurantId, onAddItem }: FoodPairingSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPairings = async () => {
      if (!currentItem.name) return;

      setLoading(true);
      try {
        // Find matching category
        const itemNameLower = currentItem.name.toLowerCase();
        let pairingCategories: string[] = [];
        
        for (const [keyword, pairings] of Object.entries(PAIRING_RULES)) {
          if (itemNameLower.includes(keyword)) {
            pairingCategories = pairings;
            break;
          }
        }

        if (pairingCategories.length === 0) {
          // Default pairings
          pairingCategories = ['Drink', 'Sides'];
        }

        // Fetch items from same restaurant that match pairings
        const { data } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_available', true)
          .neq('id', currentItem.id)
          .limit(4);

        if (data) {
          // Filter and sort by matching categories
          const matched = data.filter(item => {
            const itemCat = item.category.toLowerCase();
            const itemName = item.name.toLowerCase();
            return pairingCategories.some(
              cat => itemCat.includes(cat.toLowerCase()) || itemName.includes(cat.toLowerCase())
            );
          });

          setSuggestions(matched.slice(0, 3).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            restaurantId: item.restaurant_id,
            image: item.image,
            category: item.category,
            calories: item.calories,
            description: item.description,
            popular: item.is_popular || false,
          })));
        }
      } catch (error) {
        console.error('Error fetching pairings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPairings();
  }, [currentItem, restaurantId]);

  if (loading || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 border border-border"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">Goes well with</span>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 p-2 bg-muted rounded-lg shrink-0"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="text-sm font-medium text-foreground whitespace-nowrap">{item.name}</p>
              <p className="text-xs text-primary">{formatPKR(item.price)}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAddItem(item)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FoodPairingSuggestions;
