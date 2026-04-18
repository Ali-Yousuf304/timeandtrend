-- Create discounts table
CREATE TABLE public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active discounts"
ON public.discounts FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage discounts"
ON public.discounts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_discounts_updated_at
BEFORE UPDATE ON public.discounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Track promo usage on orders
ALTER TABLE public.orders
  ADD COLUMN promo_code TEXT,
  ADD COLUMN discount_amount NUMERIC NOT NULL DEFAULT 0;

-- Function to safely increment promo usage (called after order creation)
CREATE OR REPLACE FUNCTION public.increment_discount_usage(_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.discounts
  SET usage_count = usage_count + 1
  WHERE code = _code;
END;
$$;