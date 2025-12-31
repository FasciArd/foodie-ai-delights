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

// Pakistani-focused categories like FoodPanda Pakistan
const PAKISTANI_CATEGORIES = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'biryani', name: 'Biryani', icon: '🍚' },
  { id: 'karahi', name: 'Karahi', icon: '🥘' },
  { id: 'bbq', name: 'BBQ & Tikka', icon: '🍖' },
  { id: 'fast-food', name: 'Fast Food', icon: '🍔' },
  { id: 'desi', name: 'Desi Khana', icon: '🍛' },
  { id: 'paratha', name: 'Paratha Roll', icon: '🌯' },
  { id: 'chinese', name: 'Chinese', icon: '🥡' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'burger', name: 'Burgers', icon: '🍔' },
  { id: 'nihari', name: 'Nihari & Paye', icon: '🍲' },
  { id: 'street-food', name: 'Street Food', icon: '🥙' },
  { id: 'chai', name: 'Chai & Nashta', icon: '☕' },
  { id: 'mithai', name: 'Mithai', icon: '🍮' },
  { id: 'seafood', name: 'Seafood', icon: '🦐' },
];

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return PAKISTANI_CATEGORIES;
    },
  });
}
