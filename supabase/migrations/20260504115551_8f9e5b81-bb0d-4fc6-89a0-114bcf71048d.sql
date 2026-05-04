ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS postex_api_key TEXT,
  ADD COLUMN IF NOT EXISTS postex_pickup_address_code TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS postex_tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS postex_shipment_data JSONB;