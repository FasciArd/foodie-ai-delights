import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toRestaurant, Restaurant } from '@/types';

// Map category IDs to database category values
const CATEGORY_MAPPING: Record<string, string[]> = {
  'biryani': ['Biryani', 'Pakistani', 'Desi'],
  'karahi': ['Karahi', 'Pakistani', 'Desi'],
  'bbq': ['BBQ', 'BBQ & Tikka', 'Grill', 'Pakistani'],
  'fast-food': ['Fast Food', 'Burgers', 'Pizza'],
  'desi': ['Desi', 'Pakistani', 'Traditional'],
  'paratha': ['Paratha', 'Street Food', 'Pakistani'],
  'chinese': ['Chinese', 'Asian'],
  'pizza': ['Pizza', 'Italian', 'Fast Food'],
  'burger': ['Burgers', 'Fast Food', 'American'],
  'nihari': ['Nihari', 'Pakistani', 'Traditional'],
  'street-food': ['Street Food', 'Chaat', 'Pakistani'],
  'chai': ['Chai', 'Breakfast', 'Nashta'],
  'mithai': ['Mithai', 'Desserts', 'Sweets'],
  'seafood': ['Seafood', 'Fish'],
};

export function useRestaurantsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['restaurants-by-category', categoryId],
    queryFn: async (): Promise<Restaurant[]> => {
      if (categoryId === 'all') {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('is_active', true)
          .order('rating', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(toRestaurant);
      }

      const categoryValues = CATEGORY_MAPPING[categoryId] || [categoryId];
      
      // Search in category and tags
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .or(
          categoryValues.map(cat => `category.ilike.%${cat}%`).join(',') + 
          ',' + 
          categoryValues.map(cat => `tags.cs.{${cat}}`).join(',')
        )
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(toRestaurant);
    },
  });
}
