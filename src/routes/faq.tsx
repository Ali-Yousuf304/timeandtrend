import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/brand';
import { PolicyPage } from '@/components/site/PolicyPage';
export const Route = createFileRoute('/faq')({ head: () => pageHead("FAQ", "FAQ and customer care information for Subhani Studio in Pakistan."), component: Page });
function Page() { return <PolicyPage title="FAQ" sections={[["Ordering and payment", "Cash on Delivery is available across Pakistan. Contact us for bank transfer, JazzCash or Easypaisa payment instructions before paying."], ["Delivery", "Delivery charges and free delivery eligibility appear at checkout. Delivery timing depends on your city and courier availability."], ["Product questions", "Contact our team for sizes, materials, fragrance notes or gift-box contents before ordering."]]} />; }
