-- Site settings (single-row config)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_methods jsonb NOT NULL DEFAULT '[{"id":"cod","label":"Cash on Delivery","enabled":true},{"id":"card","label":"Credit / Debit Card","enabled":false},{"id":"bank","label":"Bank Transfer","enabled":false}]'::jsonb,
  shipping_flat_rate numeric NOT NULL DEFAULT 10,
  shipping_free_threshold numeric NOT NULL DEFAULT 200,
  shipping_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed one row
INSERT INTO public.site_settings (id) VALUES (gen_random_uuid());