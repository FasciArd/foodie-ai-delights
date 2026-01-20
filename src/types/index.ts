import type { Database } from '@/integrations/supabase/types';

// Database types
export type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];
export type DbMenuItem = Database['public']['Tables']['menu_items']['Row'];

// Frontend types with camelCase (for mock data compatibility)
export interface Restaurant {
  id: string;
  name: string;
  image: string | null;
  category: string;
  rating: number | null;
  deliveryTime: string | null;
  deliveryFee: number | null;
  distance?: string;
  featured?: boolean;
  tags: string[] | null;
  description?: string | null;
  is_active?: boolean | null;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  calories: number | null;
  popular?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

// Transform database types to frontend types
export const toRestaurant = (db: DbRestaurant): Restaurant => ({
  id: db.id,
  name: db.name,
  image: db.image,
  category: db.category,
  rating: db.rating,
  deliveryTime: db.delivery_time,
  deliveryFee: db.delivery_fee,
  distance: '1.2 km',
  tags: db.tags,
  description: db.description,
  is_active: db.is_active,
});

export const toMenuItem = (db: DbMenuItem): MenuItem => ({
  id: db.id,
  restaurantId: db.restaurant_id,
  name: db.name,
  description: db.description,
  price: db.price,
  image: db.image,
  category: db.category,
  calories: db.calories,
  popular: db.is_popular || false,
});

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'on-the-way' | 'delivered';
  totalPrice: number;
  totalCalories: number;
  deliveryAddress: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'restaurant' | 'driver' | 'admin';
}
