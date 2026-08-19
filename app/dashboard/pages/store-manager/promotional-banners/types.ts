// app/dashboard/pages/store-manager/promotional-banners/types.ts

export interface Banner {
  id: string;
  title: string;
  discount: string;        // e.g. "25% OFF" or "Shop Now"
  active: boolean;
  imageUrl?: string;       // optional image URL
  link?: string;           // optional URL to redirect when clicked
  order: number;
}