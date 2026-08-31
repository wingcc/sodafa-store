import CheckoutClient from './components/CheckoutClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Checkout | WellnessMarket',
  description: 'Complete your order — shipping, contact info, and order review.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}