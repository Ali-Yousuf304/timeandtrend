-- Make wishlist work with both seeded and DB products by using TEXT product_key
ALTER TABLE public.wishlist_items DROP CONSTRAINT wishlist_items_product_id_fkey;
ALTER TABLE public.wishlist_items DROP CONSTRAINT wishlist_items_user_id_product_id_key;
ALTER TABLE public.wishlist_items ALTER COLUMN product_id TYPE TEXT USING product_id::text;
ALTER TABLE public.wishlist_items ADD CONSTRAINT wishlist_items_user_id_product_id_key UNIQUE (user_id, product_id);

-- Same for order_items
ALTER TABLE public.order_items DROP CONSTRAINT order_items_product_id_fkey;
ALTER TABLE public.order_items ALTER COLUMN product_id TYPE TEXT USING product_id::text;