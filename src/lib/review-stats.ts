export interface RatedReview { rating: number; enabled?: boolean; product_id?: string }

export function approvedReviewStats(reviews: RatedReview[]) {
  const approved = reviews.filter((r) => r.enabled === true);
  return {
    count: approved.length,
    average: approved.length ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length : 0,
  };
}