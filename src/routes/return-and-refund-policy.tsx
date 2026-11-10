import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/brand';
import { PolicyPage } from '@/components/site/PolicyPage';
export const Route = createFileRoute('/return-and-refund-policy')({ head: () => pageHead("Return and Refund Policy", "Return and Refund Policy and customer care information for Subhani Studio in Pakistan."), component: Page });
function Page() { return <PolicyPage title="Return and Refund Policy" sections={[["Returns", "Contact our team with your order number and photos if an item arrives damaged, incorrect or unsuitable. Return eligibility and timing will be confirmed by the store."], ["Refunds", "Approved refunds are arranged after inspection. Used fragrance products and personal wear may have hygiene restrictions; ask before ordering."]]} />; }
