import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/brand';
import { PolicyPage } from '@/components/site/PolicyPage';
export const Route = createFileRoute('/terms-and-conditions')({ head: () => pageHead("Terms and Conditions", "Terms and Conditions and customer care information for Subhani Studio in Pakistan."), component: Page });
function Page() { return <PolicyPage title="Terms and Conditions" sections={[["Orders", "Orders are subject to stock availability and confirmation. Prices are in Pakistani rupees. Contact us promptly if your order details are incorrect."], ["Product information", "Photos and sample specifications are indicative. The store will confirm final product details and any availability changes."]]} />; }
