import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/brand';
import { PolicyPage } from '@/components/site/PolicyPage';
export const Route = createFileRoute('/shipping-policy')({ head: () => pageHead("Shipping Policy", "Shipping Policy and customer care information for Subhani Studio in Pakistan."), component: Page });
function Page() { return <PolicyPage title="Shipping Policy" sections={[["Pakistan delivery", "Standard delivery is Rs. 250, with free delivery on eligible orders above Rs. 1,999. Current charges are shown at checkout and may be updated by the store."], ["Tracking", "Courier tracking is provided after dispatch when available. Delivery dates vary by location; please provide a complete address and reachable phone number."]]} />; }
