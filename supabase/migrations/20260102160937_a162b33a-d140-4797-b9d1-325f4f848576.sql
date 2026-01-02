-- Add role-specific profile fields for user/restaurant/rider registration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT,

-- Restaurant-specific fields
ADD COLUMN IF NOT EXISTS restaurant_name TEXT,
ADD COLUMN IF NOT EXISTS cuisine_type TEXT,
ADD COLUMN IF NOT EXISTS business_license TEXT,
ADD COLUMN IF NOT EXISTS operating_hours TEXT,

-- Rider-specific fields
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS license_plate TEXT,
ADD COLUMN IF NOT EXISTS cnic TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Add wallet balance tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10,2) DEFAULT 0;

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'topup')),
  description TEXT,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert transactions for themselves
CREATE POLICY "Users can create transactions" ON public.wallet_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create pre-orders table
CREATE TABLE IF NOT EXISTS public.pre_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pre_orders
ALTER TABLE public.pre_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own pre-orders
CREATE POLICY "Users can view their own pre-orders" ON public.pre_orders
FOR SELECT USING (auth.uid() = user_id);

-- Users can create pre-orders
CREATE POLICY "Users can create pre-orders" ON public.pre_orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pre-orders
CREATE POLICY "Users can update their own pre-orders" ON public.pre_orders
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own pre-orders
CREATE POLICY "Users can delete their own pre-orders" ON public.pre_orders
FOR DELETE USING (auth.uid() = user_id);

-- Add more Pakistani restaurants for dummy data
INSERT INTO public.restaurants (name, category, image, rating, delivery_time, delivery_fee, tags, description, is_active) VALUES
('Student Biryani', 'Pakistani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', 4.4, '30-40 min', 35, ARRAY['Biryani', 'Budget', 'Halal'], 'Affordable biryani for students and families', true),
('Kaybees', 'Fast Food', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 4.6, '25-35 min', 45, ARRAY['Burgers', 'Pizza', 'Fast Food'], 'Popular burgers and fast food in Karachi', true),
('Kolachi', 'Pakistani', 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800', 4.8, '45-60 min', 80, ARRAY['Seafood', 'BBQ', 'Premium'], 'Premium dining experience at Karachi coast', true),
('OPTP', 'Fast Food', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', 4.5, '20-30 min', 40, ARRAY['Burgers', 'Fries', 'Fast Food'], 'One Potato Two Potato - Famous burgers', true),
('Kababjees', 'Pakistani', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800', 4.7, '35-45 min', 50, ARRAY['BBQ', 'Kebabs', 'Tikka', 'Halal'], 'Best BBQ and kebabs in Karachi', true),
('Howdy', 'Fast Food', 'https://images.unsplash.com/photo-1551360374-04a5f6d82c81?w=800', 4.3, '20-30 min', 35, ARRAY['Burgers', 'Fast Food', 'American'], 'American-style burgers and shakes', true),
('Zahid Nihari', 'Pakistani', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', 4.9, '30-45 min', 40, ARRAY['Nihari', 'Traditional', 'Halal'], 'Famous Karachi nihari since 1960', true),
('Chai Wala', 'Street Food', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800', 4.2, '15-25 min', 25, ARRAY['Chai', 'Nashta', 'Street Food'], 'Authentic desi chai and nashta', true),
('Pizza Hut Karachi', 'Pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800', 4.4, '30-45 min', 50, ARRAY['Pizza', 'Italian', 'Fast Food'], 'Pizza Hut Pakistan - Pan Pizza favorites', true),
('McDonald Karachi', 'Fast Food', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 4.3, '20-30 min', 40, ARRAY['Burgers', 'Fast Food', 'American'], 'McDonald''s Pakistan - McSpicy and more', true),
('Lal Qila', 'Pakistani', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800', 4.6, '40-55 min', 60, ARRAY['Mughlai', 'Biryani', 'Premium', 'Halal'], 'Mughlai cuisine and premium biryani', true),
('BBQ Tonight', 'Pakistani', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', 4.7, '35-50 min', 55, ARRAY['BBQ', 'Grilled', 'Halal', 'Premium'], 'All-you-can-eat BBQ experience', true)
ON CONFLICT DO NOTHING;

-- Add more menu items
INSERT INTO public.menu_items (restaurant_id, name, description, price, image, category, calories, is_popular, is_available) 
SELECT r.id, 'Zinger Burger', 'Crispy fried chicken fillet with spicy mayo', 550, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Burgers', 650, true, true
FROM public.restaurants r WHERE r.name = 'Kaybees' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_items (restaurant_id, name, description, price, image, category, calories, is_popular, is_available) 
SELECT r.id, 'Budget Zinger', 'Smaller zinger burger - great value', 250, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', 'Burgers', 450, true, true
FROM public.restaurants r WHERE r.name = 'Howdy' LIMIT 1
ON CONFLICT DO NOTHING;