-- Add business_type to restaurants table to distinguish restaurant vs homechef
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS business_type text NOT NULL DEFAULT 'restaurant' 
CHECK (business_type IN ('restaurant', 'homechef'));

-- Add delivery_radius to restaurants
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS delivery_radius numeric DEFAULT 5;

-- Add review_image column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS image_url text;

-- Create earnings table for tracking all earnings
CREATE TABLE IF NOT EXISTS public.earnings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    user_type text NOT NULL CHECK (user_type IN ('restaurant', 'homechef', 'driver')),
    gross_amount numeric NOT NULL DEFAULT 0,
    commission_rate numeric NOT NULL DEFAULT 0.10,
    commission_amount numeric NOT NULL DEFAULT 0,
    net_amount numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'withdrawn')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on earnings
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Earnings RLS policies
CREATE POLICY "Users can view their own earnings"
ON public.earnings
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert earnings"
ON public.earnings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update earnings"
ON public.earnings
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create withdrawals table for payout tracking
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    amount numeric NOT NULL,
    method text NOT NULL CHECK (method IN ('easypaisa', 'jazzcash', 'bank')),
    account_number text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    transaction_ref text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz
);

-- Enable RLS on withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Withdrawals RLS policies
CREATE POLICY "Users can view their own withdrawals"
ON public.withdrawals
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own withdrawals"
ON public.withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update withdrawals"
ON public.withdrawals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_earnings_user_id ON public.earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_order_id ON public.earnings(order_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_business_type ON public.restaurants(business_type);

-- Add trigger for updated_at on earnings
CREATE TRIGGER update_earnings_updated_at
BEFORE UPDATE ON public.earnings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();