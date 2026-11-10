import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { catalogImage } from '@/lib/catalog-images';

export interface StoreCollection { id: string; name: string; slug: string; image: string; show_in_navbar: boolean; sort_order: number }
export function useCollections() {
  const [collections, setCollections] = useState<StoreCollection[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    supabase.from('collections').select('id,name,slug,image,show_in_navbar,sort_order').eq('active', true).eq('kind', 'category').order('sort_order').order('name').then(({ data }) => {
      if (cancelled) return;
      setCollections((data ?? []).map(c => ({ ...c, image: c.image ? catalogImage(c.image) : '' })));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);
  return { collections, navbarCollections: collections.filter(c => c.show_in_navbar), loading };
}