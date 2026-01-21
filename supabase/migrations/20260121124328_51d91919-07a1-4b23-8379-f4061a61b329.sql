-- Create tax_bills table for tracking tax bills history
CREATE TABLE public.tax_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  withdrawal_id UUID REFERENCES public.withdrawals(id),
  user_type TEXT NOT NULL,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  withdrawn_amount NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0.10,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  net_payout NUMERIC NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create account_locks table for tracking locked accounts
CREATE TABLE public.account_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  tax_bill_id UUID REFERENCES public.tax_bills(id),
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlocked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_locks ENABLE ROW LEVEL SECURITY;

-- RLS for tax_bills
CREATE POLICY "Users can view their own tax bills"
ON public.tax_bills
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create tax bills on withdrawal"
ON public.tax_bills
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax bills to mark as paid"
ON public.tax_bills
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS for account_locks
CREATE POLICY "Users can view their own lock status"
ON public.account_locks
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage account locks"
ON public.account_locks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_tax_bills_updated_at
BEFORE UPDATE ON public.tax_bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.tax_bills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.account_locks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.earnings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;