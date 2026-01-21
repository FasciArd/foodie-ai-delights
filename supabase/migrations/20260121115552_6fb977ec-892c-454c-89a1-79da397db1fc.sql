-- Fix the earnings insert policy to be more restrictive
DROP POLICY IF EXISTS "System can insert earnings" ON public.earnings;

-- Only allow inserting earnings where user_id matches the order owner or driver
CREATE POLICY "Authenticated users can insert their earnings"
ON public.earnings
FOR INSERT
WITH CHECK (auth.uid() = user_id);