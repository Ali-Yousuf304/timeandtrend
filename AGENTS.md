# Project architecture
- Use `src/lib/brand.ts` for the default store identity and page metadata, with `site_settings.store_name` overriding visible branding, so rebrands remain centralized.
- Derive storefront review statistics from approved review records using `approvedReviewStats`; never use the legacy product rating column as customer evidence.
- Preserve existing TanStack routing and commerce/admin integrations when changing storefront presentation.
- Use the shared public collection hook for navigation, collection tiles, filters and product categories; admin collection visibility and ordering stay authoritative.
- Store newsletter subscriptions with insert-only public access and admin-only reads so subscriber emails remain private.