import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toRestaurant, Restaurant } from '@/types';

// Map category IDs to EXACT database category values - strict matching
const CATEGORY_MAPPING: Record<string, string[]> = {
  'biryani': ['Biryani'],
  'karahi': ['Karahi'],
  'bbq': ['BBQ'],
  'fast-food': ['Fast Food'],
  'desi': ['Pakistani', 'Desi', 'Traditional'],
  'paratha-roll': ['Paratha Roll'],
  'chinese': ['Chinese'],
  'pizza': ['Pizza'],
  'burger': ['Burgers'],
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

      const categoryValues = CATEGORY_MAPPING[categoryId];
      
      if (!categoryValues) {
        return [];
      }
      
      // Strict matching - only match exact category values
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .in('category', categoryValues)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(toRestaurant);
    },
  });
}
