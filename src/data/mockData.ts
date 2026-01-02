import { Restaurant, MenuItem } from '@/types';

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Biryani House',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    category: 'Biryani',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 100,
    distance: '1.2 km',
    featured: true,
    tags: ['Biryani', 'Pulao', 'Rice'],
  },
  {
    id: '2',
    name: 'Karahi Corner',
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80',
    category: 'Karahi',
    rating: 4.9,
    deliveryTime: '30-40 min',
    deliveryFee: 80,
    distance: '0.8 km',
    featured: true,
    tags: ['Karahi', 'Handi', 'Desi'],
  },
  {
    id: '3',
    name: 'BBQ Nation',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    category: 'BBQ',
    rating: 4.7,
    deliveryTime: '35-45 min',
    deliveryFee: 120,
    distance: '1.5 km',
    featured: true,
    tags: ['BBQ', 'Tikka', 'Kebab'],
  },
  {
    id: '4',
    name: 'China Express',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    category: 'Chinese',
    rating: 4.6,
    deliveryTime: '25-35 min',
    deliveryFee: 70,
    distance: '2.0 km',
    featured: false,
    tags: ['Chinese', 'Noodles', 'Rice'],
  },
  {
    id: '5',
    name: 'Pizza Palace',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    category: 'Pizza',
    rating: 4.5,
    deliveryTime: '30-40 min',
    deliveryFee: 150,
    distance: '1.0 km',
    featured: false,
    tags: ['Pizza', 'Italian'],
  },
  {
    id: '6',
    name: 'Burger Station',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    category: 'Burgers',
    rating: 4.4,
    deliveryTime: '20-30 min',
    deliveryFee: 80,
    distance: '0.5 km',
    featured: true,
    tags: ['Burgers', 'Fast Food'],
  },
  {
    id: '7',
    name: 'Roll Master',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    category: 'Paratha Roll',
    rating: 4.7,
    deliveryTime: '15-25 min',
    deliveryFee: 50,
    distance: '1.3 km',
    featured: false,
    tags: ['Paratha Roll', 'Rolls', 'Street Food'],
  },
  {
    id: '8',
    name: 'Desi Dhaba',
    image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80',
    category: 'Pakistani',
    rating: 4.8,
    deliveryTime: '30-40 min',
    deliveryFee: 60,
    distance: '1.8 km',
    featured: false,
    tags: ['Desi', 'Pakistani', 'Traditional'],
  },
];

export const menuItems: MenuItem[] = [
  // Biryani House
  {
    id: 'm1',
    restaurantId: '1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken and secret spices',
    price: 400,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    category: 'Biryani',
    calories: 650,
    popular: true,
  },
  {
    id: 'm2',
    restaurantId: '1',
    name: 'Mutton Biryani',
    description: 'Premium mutton biryani with traditional spices',
    price: 600,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    category: 'Biryani',
    calories: 750,
    popular: true,
  },
  // Karahi Corner
  {
    id: 'm3',
    restaurantId: '2',
    name: 'Chicken Karahi',
    description: 'Fresh tomato-based chicken karahi',
    price: 850,
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80',
    category: 'Karahi',
    calories: 550,
    popular: true,
  },
  {
    id: 'm4',
    restaurantId: '2',
    name: 'Mutton Karahi',
    description: 'Tender mutton in spicy karahi masala',
    price: 1400,
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80',
    category: 'Karahi',
    calories: 650,
    popular: true,
  },
  // BBQ Nation
  {
    id: 'm5',
    restaurantId: '3',
    name: 'Chicken Tikka',
    description: 'Juicy marinated chicken tikka',
    price: 600,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    category: 'BBQ',
    calories: 350,
    popular: true,
  },
  {
    id: 'm6',
    restaurantId: '3',
    name: 'Seekh Kebab',
    description: 'Minced beef seekh kebab',
    price: 500,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
    category: 'BBQ',
    calories: 320,
    popular: false,
  },
  // Pizza Palace
  {
    id: 'm7',
    restaurantId: '5',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    category: 'Pizza',
    calories: 850,
    popular: true,
  },
  {
    id: 'm8',
    restaurantId: '5',
    name: 'Chicken Fajita Pizza',
    description: 'Loaded chicken fajita pizza',
    price: 1400,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    category: 'Pizza',
    calories: 920,
    popular: true,
  },
  // Burger Station
  {
    id: 'm9',
    restaurantId: '6',
    name: 'Beef Burger',
    description: 'Juicy beef patty with fresh veggies',
    price: 550,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    category: 'Burgers',
    calories: 650,
    popular: true,
  },
  {
    id: 'm10',
    restaurantId: '6',
    name: 'Chicken Zinger',
    description: 'Crispy chicken burger with special sauce',
    price: 500,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    category: 'Burgers',
    calories: 580,
    popular: true,
  },
  // Roll Master
  {
    id: 'm11',
    restaurantId: '7',
    name: 'Chicken Tikka Roll',
    description: 'Crispy paratha with juicy chicken tikka',
    price: 280,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    category: 'Paratha Roll',
    calories: 420,
    popular: true,
  },
  {
    id: 'm12',
    restaurantId: '7',
    name: 'Beef Seekh Roll',
    description: 'Paratha roll with seekh kebab',
    price: 300,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    category: 'Paratha Roll',
    calories: 450,
    popular: true,
  },
  // China Express
  {
    id: 'm13',
    restaurantId: '4',
    name: 'Chicken Manchurian',
    description: 'Crispy chicken in tangy sauce',
    price: 480,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80',
    category: 'Chinese',
    calories: 480,
    popular: true,
  },
  {
    id: 'm14',
    restaurantId: '4',
    name: 'Chicken Chow Mein',
    description: 'Stir-fried noodles with chicken',
    price: 450,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    category: 'Chinese',
    calories: 520,
    popular: true,
  },
];

export const categories = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'biryani', name: 'Biryani', icon: '🍚' },
  { id: 'karahi', name: 'Karahi', icon: '🥘' },
  { id: 'bbq', name: 'BBQ', icon: '🍗' },
  { id: 'fast-food', name: 'Fast Food', icon: '🍟' },
  { id: 'desi', name: 'Desi Khana', icon: '🍛' },
  { id: 'paratha-roll', name: 'Paratha Roll', icon: '🌯' },
  { id: 'chinese', name: 'Chinese', icon: '🥡' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'burger', name: 'Burger', icon: '🍔' },
];

export const getRestaurantById = (id: string): Restaurant | undefined => {
  return restaurants.find((r) => r.id === id);
};

export const getMenuItemsByRestaurant = (restaurantId: string): MenuItem[] => {
  return menuItems.filter((item) => item.restaurantId === restaurantId);
};

export const getFeaturedRestaurants = (): Restaurant[] => {
  return restaurants.filter((r) => r.featured);
};

export const searchRestaurants = (query: string): Restaurant[] => {
  const lowercaseQuery = query.toLowerCase();
  return restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(lowercaseQuery) ||
      r.category.toLowerCase().includes(lowercaseQuery) ||
      r.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};
