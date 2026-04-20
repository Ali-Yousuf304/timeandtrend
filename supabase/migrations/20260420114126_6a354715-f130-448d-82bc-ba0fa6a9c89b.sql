-- Collections table for admin-managed groupings
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'category', -- 'category' | 'style'
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, slug)
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active collections"
  ON public.collections FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage collections"
  ON public.collections FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed from existing product categories & styles
INSERT INTO public.collections (name, slug, kind, sort_order)
SELECT INITCAP(category) AS name, LOWER(category) AS slug, 'category' AS kind,
       ROW_NUMBER() OVER (ORDER BY category) AS sort_order
FROM (SELECT DISTINCT category FROM public.products WHERE category IS NOT NULL AND category <> '') c
ON CONFLICT (kind, slug) DO NOTHING;

INSERT INTO public.collections (name, slug, kind, sort_order)
SELECT INITCAP(style) AS name, LOWER(style) AS slug, 'style' AS kind,
       ROW_NUMBER() OVER (ORDER BY style) AS sort_order
FROM (SELECT DISTINCT style FROM public.products WHERE style IS NOT NULL AND style <> '') s
ON CONFLICT (kind, slug) DO NOTHING;