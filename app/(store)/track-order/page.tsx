// app/(store)/track-order/page.tsx
import type { Metadata } from 'next';
import TrackOrderClient from './TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order – SODFA',
  description: 'Enter your order number to track the status of your SODFA order.',
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}