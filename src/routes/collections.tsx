import { createFileRoute } from '@tanstack/react-router';
import { Catalog } from '@/components/site/Catalog';
import { pageHead } from '@/lib/brand';
export const Route = createFileRoute('/collections')({head:()=>pageHead('Collections','Explore Subhani Studio collections for peaceful daily worship and meaningful gifting.'),component:()=> <Catalog />});
