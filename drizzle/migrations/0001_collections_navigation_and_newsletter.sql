ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS image text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS show_in_navbar boolean NOT NULL DEFAULT true;
CREATE TABLE public.newsletter_subscribers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'), created_at timestamptz NOT NULL DEFAULT now());
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone may subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));