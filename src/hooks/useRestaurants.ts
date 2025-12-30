import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toRestaurant, toMenuItem, Restaurant, MenuItem } from '@/types';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(toRestaurant);
    },
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return toRestaurant(data);
    },
    enabled: !!id,
  });
}
}

export function useFeaturedRestaurants() {
  return useQuery({
    queryKey: ['featured-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return (data || []).map(toRestaurant);
    },
  });
}
}

export function useMenuItems(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu-items', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);
      
      if (error) throw error;
      return (data || []).map(toMenuItem);
    },
    enabled: !!restaurantId,
  });
}
}

export function usePopularMenuItems() {
  return useQuery({
    queryKey: ['popular-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_popular', true)
        .eq('is_available', true)
        .limit(10);
      
      if (error) throw error;
      return (data || []).map(toMenuItem);
    },
  });
}
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('category')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const uniqueCategories = [...new Set(data.map(r => r.category))];
      const categoryIcons: Record<string, string> = {
        'Pakistani': '🍛',
        'Chinese': '🥡',
        'Fast Food': '🍔',
        'Street Food': '🥙',
        'Italian': '🍕',
        'Indian': '🍲',
        'BBQ': '🍖',
        'Desserts': '🍰',
      };
      
      return [
        { id: 'all', name: 'All', icon: '🍽️' },
        ...uniqueCategories.map(cat => ({
          id: cat.toLowerCase(),
          name: cat,
          icon: categoryIcons[cat] || '🍴',
        })),
      ];
    },
  });
}
