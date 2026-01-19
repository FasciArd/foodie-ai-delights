-- Create storage bucket for restaurant and menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for food-images bucket
-- Restaurant owners can upload images
CREATE POLICY "Restaurant owners can upload food images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'food-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('restaurant', 'admin')
  )
);

-- Anyone can view food images (they are public)
CREATE POLICY "Anyone can view food images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'food-images');

-- Restaurant owners can update their own images
CREATE POLICY "Restaurant owners can update food images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'food-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('restaurant', 'admin')
  )
);

-- Restaurant owners can delete their own images
CREATE POLICY "Restaurant owners can delete food images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'food-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('restaurant', 'admin')
  )
);

-- Add logo and opening_hours columns to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS logo text,
ADD COLUMN IF NOT EXISTS opening_hours text DEFAULT '09:00 AM - 11:00 PM';

-- Allow restaurant owners to delete their own restaurants (drop if exists first)
DROP POLICY IF EXISTS "Restaurant owners can delete their restaurants" ON public.restaurants;
CREATE POLICY "Restaurant owners can delete their restaurants"
ON public.restaurants
FOR DELETE
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));