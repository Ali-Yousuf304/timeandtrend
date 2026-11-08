import { createFileRoute } from '@tanstack/react-router';
import { Catalog } from '@/components/site/Catalog';
import { pageHead } from '@/lib/brand';
export const Route = createFileRoute('/gift-boxes')({head:()=>pageHead('Hadiya Gift Boxes','Meaningful Islamic gift boxes with prayer essentials, attar and tasbeeh, delivered across Pakistan.'),component:()=> <Catalog initialCategory="gift-boxes" title="Hadiya, from the heart" />});
