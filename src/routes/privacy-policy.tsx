import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/brand';
import { PolicyPage } from '@/components/site/PolicyPage';
export const Route = createFileRoute('/privacy-policy')({ head: () => pageHead("Privacy Policy", "Privacy Policy and customer care information for Subhani Studio in Pakistan."), component: Page });
function Page() { return <PolicyPage title="Privacy Policy" sections={[["Your information", "We use your contact and delivery information to process orders and answer your inquiries. We share delivery details with the courier only as needed."], ["Your choices", "Contact us to request access, correction or deletion of your information, subject to order and legal record requirements."]]} />; }
