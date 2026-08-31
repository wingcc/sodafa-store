import type { StaticImageData } from 'next/image';

export type ProductMoreInfo = {
  ingredients?: string[];
  ingredientsFull?: string;
  benefits?: string[];
  howToUse?: string;
  shoppingInfo?: string;
  [key: string]: unknown;
};

export type Product = {
  id: string | number;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number | null;
  image?: string | StaticImageData;
  imageAlt?: string;
  badge?: string | null;
  ShowInStor?: boolean;
  showInStore?: boolean;
  inStock?: boolean;
  stock?: number;
  ADS?: boolean;
  ads?: boolean;
  brand?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  sales?: number;
  description?: string;
  tags?: string[];
  bannerImage?: string | StaticImageData;
  bannerImageAlt?: string;
  bannerText?: string;
  highlights?: string[];
  images?: Array<{ src: string | StaticImageData; alt?: string }>;
  variants?: Record<string, string[]>;
  isOffer?: boolean;
  offerTime?: string;
  moreInfo?: {
    ingredients: string[];
    ingredientsFull: string;
    benefits: string[];
    howToUse: string;
    shoppingInfo: string;
  };
};