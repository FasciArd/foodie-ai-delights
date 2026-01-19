-- Add unique constraint on profiles.user_id for FK relationship
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Add foreign key from drivers.user_id to profiles.user_id
ALTER TABLE public.drivers 
ADD CONSTRAINT drivers_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add RLS policy to allow admins and restaurant owners to view driver profiles
CREATE POLICY "Restaurant owners can view driver profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'restaurant'::app_role)
);