import { Restaurant, MenuItem } from '@/types';

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Spice Garden',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    category: 'Indian',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    distance: '1.2 km',
    featured: true,
    tags: ['Curry', 'Biryani', 'Naan'],
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    category: 'Japanese',
    rating: 4.9,
    deliveryTime: '20-30 min',
    deliveryFee: 3.49,
    distance: '0.8 km',
    featured: true,
    tags: ['Sushi', 'Ramen', 'Tempura'],
  },
  {
    id: '3',
    name: 'Bella Italia',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    category: 'Italian',
    rating: 4.7,
    deliveryTime: '30-40 min',
    deliveryFee: 2.49,
    distance: '1.5 km',
    featured: true,
    tags: ['Pizza', 'Pasta', 'Risotto'],
  },
  {
    id: '4',
    name: 'Dragon Palace',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    category: 'Chinese',
    rating: 4.6,
    deliveryTime: '25-35 min',
    deliveryFee: 1.99,
    distance: '2.0 km',
    featured: false,
    tags: ['Dim Sum', 'Noodles', 'Dumplings'],
  },
  {
    id: '5',
    name: 'El Mexicano',
    image: 'https://images.unsplash.com/photo-1653501774859-e0f66a91e3e3?w=800&q=80',
    category: 'Mexican',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: 2.29,
    distance: '1.0 km',
    featured: false,
    tags: ['Tacos', 'Burritos', 'Quesadillas'],
  },
  {
    id: '6',
    name: 'The Burger Joint',
    image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
    category: 'American',
    rating: 4.4,
    deliveryTime: '15-25 min',
    deliveryFee: 1.49,
    distance: '0.5 km',
    featured: true,
    tags: ['Burgers', 'Fries', 'Shakes'],
  },
  {
    id: '7',
    name: 'Green Garden',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
    category: 'Healthy',
    rating: 4.7,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    distance: '1.3 km',
    featured: false,
    tags: ['Salads', 'Smoothies', 'Vegan'],
  },
  {
    id: '8',
    name: 'Thai Orchid',
    image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80',
    category: 'Thai',
    rating: 4.8,
    deliveryTime: '25-40 min',
    deliveryFee: 2.79,
    distance: '1.8 km',
    featured: false,
    tags: ['Pad Thai', 'Green Curry', 'Tom Yum'],
  },
];

export const menuItems: MenuItem[] = [
  // Spice Garden (Indian)
  {
    id: 'm1',
    restaurantId: '1',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich tomato-butter sauce with aromatic spices',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    category: 'Main Course',
    calories: 550,
    popular: true,
  },
  {
    id: 'm2',
    restaurantId: '1',
    name: 'Vegetable Biryani',
    description: 'Fragrant basmati rice with mixed vegetables and aromatic spices',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    category: 'Main Course',
    calories: 480,
    popular: true,
  },
  {
    id: 'm3',
    restaurantId: '1',
    name: 'Garlic Naan',
    description: 'Soft flatbread with garlic and butter',
    price: 3.49,
    image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&q=80',
    category: 'Bread',
    calories: 180,
  },
  {
    id: 'm4',
    restaurantId: '1',
    name: 'Samosa (2 pcs)',
    description: 'Crispy pastry filled with spiced potatoes and peas',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&q=80',
    category: 'Appetizers',
    calories: 320,
  },

  // Sakura Sushi (Japanese)
  {
    id: 'm5',
    restaurantId: '2',
    name: 'Dragon Roll',
    description: 'Shrimp tempura, eel, avocado with spicy mayo',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
    category: 'Sushi Rolls',
    calories: 420,
    popular: true,
  },
  {
    id: 'm6',
    restaurantId: '2',
    name: 'Salmon Sashimi',
    description: 'Fresh Atlantic salmon, 8 pieces',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=800&q=80',
    category: 'Sashimi',
    calories: 280,
  },
  {
    id: 'm7',
    restaurantId: '2',
    name: 'Tonkotsu Ramen',
    description: 'Rich pork bone broth with chashu, egg, and noodles',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    category: 'Ramen',
    calories: 680,
    popular: true,
  },
  {
    id: 'm8',
    restaurantId: '2',
    name: 'Edamame',
    description: 'Steamed soybeans with sea salt',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=800&q=80',
    category: 'Appetizers',
    calories: 120,
  },

  // Bella Italia (Italian)
  {
    id: 'm9',
    restaurantId: '3',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomatoes, basil on thin crust',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    category: 'Pizza',
    calories: 750,
    popular: true,
  },
  {
    id: 'm10',
    restaurantId: '3',
    name: 'Spaghetti Carbonara',
    description: 'Classic pasta with pancetta, egg, parmesan',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
    category: 'Pasta',
    calories: 620,
    popular: true,
  },
  {
    id: 'm11',
    restaurantId: '3',
    name: 'Tiramisu',
    description: 'Classic Italian coffee-flavored dessert',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
    category: 'Desserts',
    calories: 450,
  },
  {
    id: 'm12',
    restaurantId: '3',
    name: 'Bruschetta',
    description: 'Grilled bread with tomatoes, garlic, olive oil',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80',
    category: 'Appetizers',
    calories: 180,
  },

  // The Burger Joint (American)
  {
    id: 'm13',
    restaurantId: '6',
    name: 'Classic Smash Burger',
    description: 'Double beef patty, cheese, lettuce, special sauce',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    category: 'Burgers',
    calories: 850,
    popular: true,
  },
  {
    id: 'm14',
    restaurantId: '6',
    name: 'Loaded Fries',
    description: 'Crispy fries with cheese, bacon, and jalapeños',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
    category: 'Sides',
    calories: 520,
  },
  {
    id: 'm15',
    restaurantId: '6',
    name: 'Chocolate Milkshake',
    description: 'Creamy chocolate shake with whipped cream',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
    category: 'Drinks',
    calories: 480,
  },
];

export const categories = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'indian', name: 'Indian', icon: '🍛' },
  { id: 'japanese', name: 'Japanese', icon: '🍣' },
  { id: 'italian', name: 'Italian', icon: '🍕' },
  { id: 'chinese', name: 'Chinese', icon: '🥡' },
  { id: 'mexican', name: 'Mexican', icon: '🌮' },
  { id: 'american', name: 'American', icon: '🍔' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'thai', name: 'Thai', icon: '🍜' },
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
      r.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};
