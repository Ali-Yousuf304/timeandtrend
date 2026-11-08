# Project architecture
- Use `src/lib/brand.ts` for the default store identity and page metadata, with `site_settings.store_name` overriding visible branding, so rebrands remain centralized.
- Derive storefront review statistics from approved review records using `approvedReviewStats`; never use the legacy product rating column as customer evidence.
- Preserve existing TanStack routing and commerce/admin integrations when changing storefront presentation.