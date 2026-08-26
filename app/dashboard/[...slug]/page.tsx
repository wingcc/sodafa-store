'use client';

import App from '../AppDashboard';
import { useSlugRouter } from '../hooks/useSlugRouter';

export default function DashboardSlugPage() {
  useSlugRouter();
  return <App />;
}
