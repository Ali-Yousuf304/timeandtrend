import { createFileRoute } from '@tanstack/react-router';
import { Catalog } from '@/components/site/Catalog';
import { pageHead } from '@/lib/brand';
export const Route = createFileRoute('/shop')({ validateSearch: (s: Record<string,unknown>) => ({ category: typeof s.category === 'string' ? s.category : undefined }), head: () => pageHead('Shop Islamic Essentials','Shop prayer mats, attar, tasbeeh, modest prayer wear, Ihram and Quran accessories in Pakistan.'), component: Shop });
function Shop() { const { category } = Route.useSearch(); return <Catalog key={category} initialCategory={category} />; }
