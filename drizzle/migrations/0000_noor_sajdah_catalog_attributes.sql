ALTER TABLE public.products DROP CONSTRAINT products_category_check;
ALTER TABLE public.products DROP CONSTRAINT products_style_check;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]', ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'in_stock', ADD COLUMN IF NOT EXISTS material text, ADD COLUMN IF NOT EXISTS care text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT 'hero';
COMMENT ON COLUMN public.products.style IS 'Merchandising collection slug; no longer watch style.';