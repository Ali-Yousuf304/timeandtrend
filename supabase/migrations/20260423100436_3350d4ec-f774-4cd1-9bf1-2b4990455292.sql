-- Add support for multiple product images (max 5)
-- The `image` column remains as the primary image for backwards compatibility.
-- We add an `images` array for additional images.
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

-- Add payment_status and fulfillment_status to orders for the new admin order card design
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payment_status') THEN
    ALTER TABLE public.orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='fulfillment_status') THEN
    ALTER TABLE public.orders ADD COLUMN fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payment_method') THEN
    ALTER TABLE public.orders ADD COLUMN payment_method TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_amount') THEN
    ALTER TABLE public.orders ADD COLUMN shipping_amount NUMERIC NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='customer_email') THEN
    ALTER TABLE public.orders ADD COLUMN customer_email TEXT;
  END IF;
END $$;