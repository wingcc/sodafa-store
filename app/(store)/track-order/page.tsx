// app/(store)/track-order/page.tsx
import type { Metadata } from 'next';
import TrackOrderClient from './TrackOrderClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Track Your Order – SODFA',
  description: 'Enter your order number to track the status of your SODFA order.',
};

import { Suspense } from 'react';

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F3E8] flex items-center justify-center p-8"><div className="w-10 h-10 border-4 border-[#0d2f25] border-t-transparent rounded-full animate-spin" /></div>}>
      <TrackOrderClient />
    </Suspense>
  );
}