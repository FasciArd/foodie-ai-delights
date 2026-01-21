import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, MenuItem, toRestaurant, toMenuItem } from '@/types';

export function useHomeChefs() {
  return useQuery({
    queryKey: ['homechefs'],
    queryFn: async (): Promise<Restaurant[]> => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('business_type', 'homechef')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return (data || []).map(toRestaurant);
    },
  });
}

export function useHomeChef(id: string | undefined) {
  return useQuery({
    queryKey: ['homechef', id],
    queryFn: async (): Promise<Restaurant | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .eq('business_type', 'homechef')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data ? toRestaurant(data) : null;
    },
    enabled: !!id,
  });
}

export function useHomeChefMenuItems(homeChefId: string | undefined) {
  return useQuery({
    queryKey: ['homechef-menu', homeChefId],
    queryFn: async (): Promise<MenuItem[]> => {
      if (!homeChefId) return [];

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', homeChefId)
        .eq('is_available', true)
        .order('is_popular', { ascending: false });

      if (error) throw error;
      return (data || []).map(toMenuItem);
    },
    enabled: !!homeChefId,
  });
}

export function useFeaturedHomeChefs(limit = 3) {
  return useQuery({
    queryKey: ['featured-homechefs', limit],
    queryFn: async (): Promise<Restaurant[]> => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('business_type', 'homechef')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(toRestaurant);
    },
  });
}

export function useFeaturedHomeChefItems(limit = 6) {
  return useQuery({
    queryKey: ['featured-homechef-items', limit],
    queryFn: async (): Promise<(MenuItem & { restaurant: Restaurant })[]> => {
      // Get popular items from homechefs
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          restaurants!inner(*)
        `)
        .eq('is_available', true)
        .eq('is_popular', true)
        .eq('restaurants.business_type', 'homechef')
        .eq('restaurants.is_active', true)
        .limit(limit);

      if (itemsError) throw itemsError;
      
      return (items || []).map((item: any) => ({
        ...toMenuItem(item),
        restaurant: toRestaurant(item.restaurants),
      }));
    },
  });
}
