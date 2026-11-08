import { Star } from 'lucide-react';
export function Rating({ average, count }: { average: number; count: number }) {
  if (!count) return <p className="text-xs text-muted-foreground">Be the first to review</p>;
  return <div className="flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 fill-gold text-gold" /><span className="font-semibold">{average.toFixed(1)}/5</span><span className="text-muted-foreground">({count} review{count === 1 ? '' : 's'})</span></div>;
}
