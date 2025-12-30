export interface Restaurant {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: string;
  featured?: boolean;
  tags: string[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  calories: number;
  popular?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

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
