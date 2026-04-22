-- 1. Link customer queries to users (optional; anonymous submissions still allowed)
ALTER TABLE public.customer_queries
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Allow logged-in users to see their own queries
DROP POLICY IF EXISTS "Users can view their own queries" ON public.customer_queries;
CREATE POLICY "Users can view their own queries"
ON public.customer_queries FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 2. Customer query replies (thread-style)
CREATE TABLE IF NOT EXISTS public.customer_query_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid NOT NULL REFERENCES public.customer_queries(id) ON DELETE CASCADE,
  author_id uuid,
  author_role text NOT NULL CHECK (author_role IN ('admin','customer')),
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_query_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all replies"
ON public.customer_query_replies FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view replies on their queries"
ON public.customer_query_replies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.customer_queries q
    WHERE q.id = customer_query_replies.query_id
      AND q.user_id = auth.uid()
  )
);

CREATE POLICY "Users reply on their queries"
ON public.customer_query_replies FOR INSERT
WITH CHECK (
  author_role = 'customer'
  AND author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.customer_queries q
    WHERE q.id = customer_query_replies.query_id
      AND q.user_id = auth.uid()
  )
);

CREATE TRIGGER trg_cqr_updated
BEFORE UPDATE ON public.customer_query_replies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_cqr_query ON public.customer_query_replies(query_id);

-- 3. Analytics events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('page_view','product_view','add_to_cart','checkout_started','purchase_completed','wishlist_add')),
  session_id text,
  user_id uuid,
  product_id text,
  path text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read analytics"
ON public.analytics_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_ae_type_created ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_product ON public.analytics_events(product_id) WHERE product_id IS NOT NULL;

-- 4. Promo messages
CREATE TABLE IF NOT EXISTS public.promo_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo messages"
ON public.promo_messages FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage promo messages"
ON public.promo_messages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_promo_updated
BEFORE UPDATE ON public.promo_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Extend site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_address text,
  ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{"instagram":{"url":"","enabled":false},"facebook":{"url":"","enabled":false},"tiktok":{"url":"","enabled":false},"youtube":{"url":"","enabled":false}}'::jsonb;

-- 6. Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images','product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images','review-images', true)
ON CONFLICT (id) DO NOTHING;

-- product-images policies
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins manage product images" ON storage.objects;
CREATE POLICY "Admins manage product images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

-- review-images policies
DROP POLICY IF EXISTS "Public read review images" ON storage.objects;
CREATE POLICY "Public read review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

DROP POLICY IF EXISTS "Users upload own review images" ON storage.objects;
CREATE POLICY "Users upload own review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users delete own review images" ON storage.objects;
CREATE POLICY "Users delete own review images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'review-images'
  AND auth.uid() IS NOT NULL
  AND ((storage.foldername(name))[1] = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role))
);

-- 7. Add image_urls array to reviews for uploaded photos
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}'::text[];