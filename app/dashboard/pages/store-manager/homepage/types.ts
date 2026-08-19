// app/dashboard/pages/store-manager/homepage/types.ts
export interface HomepageSection {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  order: number;
  config?: Record<string, any>;
}