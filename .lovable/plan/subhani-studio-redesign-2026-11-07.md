# Subhani Studio redesign

## Result
Transform the existing store into a calm, premium Islamic lifestyle shop for Pakistan, while keeping its commerce, admin dashboard, AI assistant, shipping and order-numbering features.

## Branding and design
- Make `site_settings.store_name` the editable brand source, with one shared Subhani Studio fallback; apply it across the storefront, admin, emails and page titles. Use SS for new order numbers; preserve existing numbers.
- Use deep emerald, ivory, soft gold and charcoal, serif headings and clean body typography. Add original product imagery, subtle geometric dividers and tasteful Arabic calligraphy.
- Replace watch content and assets throughout active pages, forms, metadata, email templates and assistant prompts. Change the prefix for newly generated orders; preserve historical order numbers.

## Storefront
- Build the requested home sections in order: editable announcement, category navigation, three editable hero slides, category tiles, four featured rows, gift bundles, trust/statistics, existing reviews, social/contact/newsletter and footer.
- Add Shop and Gift Boxes pages while retaining existing public URLs. Include Quran and accessories in navigation and the catalog.
- Add category, price, color, size and availability filters, sorting, sale/stock labels, working Quick View and Add to Cart.
- Extend product pages with variants, zoom, material/care details, delivery/returns information, related products and Buy Now.
- Add About, FAQ and the five policy pages with page-specific sharing metadata.

## Catalog and admin
- Replace the watch catalog with approximately 24 sample Islamic products. The supplied assortment contains more than 24 named items; use about 28 products to cover those names, with 6ml/12ml attar and other options represented as variants.
- Include realistic PKR prices, stock and sample sold-out/pre-order states. Use clearly illustrative images, not claims of actual inventory.
- Update product/category/collection forms and assistant capabilities to match the new assortment. Preserve existing tools and order reference resolution.

## Checkout and settings
- Allow checkout without an account, with full name, phone, optional email, address, city, province and notes.
- Default to Cash on Delivery; support Bank Transfer, JazzCash and Easypaisa instructions with a private payment screenshot upload.
- Set configurable delivery to Rs. 250 and free above Rs. 1,999.
- Add editable announcement content to the existing banners administration and retain existing promotions controls.
- Keep Karachi contact details visibly identified as placeholders. Do not invent bank accounts, support numbers or social accounts; leave those configurable until supplied.
- Compute average ratings and total review counts only from real approved database reviews on cards, product pages and the home trust strip. Hide the stats strip and reviews carousel when there are none and show "Be the first to review" for empty reviews. Never seed invented testimonials or customer claims; customer counts must use real order data or be removed.

## Technical details
- Extend existing product data with generic attributes, variants and availability; retain historical order items and customer data when replacing sample products.
- Add secure server-side checkout validation, authoritative pricing and atomic order/stock writes rather than granting anonymous access to customer orders.
- Keep existing PostEx, email and AI integrations, changing only their branding/content where possible. A new email sender domain requires separate domain verification; do not switch to an unverified sender.
- Persist newsletter subscriptions securely with consent and duplicate handling.

## Verification
- Test configurable delivery rules, guest order creation, variants/stock handling and safe settings exposure.
- Check desktop and mobile shopping, Quick View, cart and checkout, plus authenticated admin catalog/settings flows and preview diagnostics.
- Publishing is separate: the current public URL remains unchanged until you publish the redesign.