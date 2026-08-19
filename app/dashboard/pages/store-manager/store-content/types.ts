// app/dashboard/pages/store-manager/store-content/types.ts

export interface ContentPage {
  id: string;
  name: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
  createdAt?: string;
  pageWidth: number;    // in pixels
  pageHeight: number;   // in pixels
}