import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { approvedReviewStats } from '@/lib/review-stats';

export function useApprovedReviews() {
  return useQuery({
    queryKey: ['approved-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase.from('reviews').select('id,product_id,rating,enabled,title,body,created_at').eq('enabled', true).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 0,
  });
}
export function useAllProductRatings() {
  const { data = [] } = useApprovedReviews();
  return (productId: string) => approvedReviewStats(data.filter((r) => r.product_id === productId));
}
export function useProductRating(productId: string | undefined) {
  const getRating = useAllProductRatings();
  return getRating(productId ?? '');
}
