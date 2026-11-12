import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/brand';
import { PolicyPage } from '@/components/site/PolicyPage';

export const Route = createFileRoute('/cancellation-policy')({
  head: () => pageHead('Cancellation Policy', 'Order cancellation guidance for Subhani Studio customers in Pakistan.'),
  component: Page,
});

function Page() {
  return <PolicyPage title="Cancellation Policy" sections={[
    { title: 'Before dispatch', text: 'Contact us as soon as possible with your order number. We will confirm whether the order can still be cancelled before it is handed to the courier.' },
    { title: 'After dispatch', text: 'Once an order has shipped, cancellation may no longer be possible. Contact our team for help with the available return options.' },
  ]} />;
}