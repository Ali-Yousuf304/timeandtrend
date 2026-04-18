
-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled reviews"
  ON public.reviews FOR SELECT
  USING (enabled = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any review"
  ON public.reviews FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any review"
  ON public.reviews FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);

-- Add logo_url to site_settings
ALTER TABLE public.site_settings
ADD COLUMN logo_url TEXT;

-- Public bucket for site assets (logo, etc.)
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read site-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site-assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site-assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'));
