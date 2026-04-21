CREATE TABLE public.customer_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a query"
ON public.customer_queries
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all queries"
ON public.customer_queries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update queries"
ON public.customer_queries
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete queries"
ON public.customer_queries
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_customer_queries_updated_at
BEFORE UPDATE ON public.customer_queries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_customer_queries_created_at ON public.customer_queries(created_at DESC);
CREATE INDEX idx_customer_queries_is_read ON public.customer_queries(is_read);