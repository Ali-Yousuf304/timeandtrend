-- Order numbering settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS order_number_prefix text DEFAULT '',
  ADD COLUMN IF NOT EXISTS order_number_suffix text DEFAULT '',
  ADD COLUMN IF NOT EXISTS order_number_next bigint NOT NULL DEFAULT 1000;

-- Per-order generated number
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique
  ON public.orders (order_number)
  WHERE order_number IS NOT NULL;

-- Atomically allocate the next formatted order number and bump the counter
CREATE OR REPLACE FUNCTION public.allocate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings_id uuid;
  v_prefix text;
  v_suffix text;
  v_next bigint;
BEGIN
  SELECT id, COALESCE(order_number_prefix, ''), COALESCE(order_number_suffix, ''), COALESCE(order_number_next, 1000)
    INTO v_settings_id, v_prefix, v_suffix, v_next
  FROM public.site_settings
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE;

  IF v_settings_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.site_settings
     SET order_number_next = v_next + 1
   WHERE id = v_settings_id;

  RETURN v_prefix || v_next::text || v_suffix;
END;
$$;

-- Trigger: assign order_number on insert if not provided
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.allocate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_set_number ON public.orders;
CREATE TRIGGER trg_orders_set_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();