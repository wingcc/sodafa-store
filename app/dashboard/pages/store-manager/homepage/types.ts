// app/dashboard/pages/store-manager/homepage/types.ts

export type HomepageTab = 'sections' | 'content' | 'reviews' | 'settings' | 'seo';

export interface HomepageSection {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  order: number;
  config?: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Content blocks (homepage_content.key → jsonb)
// ---------------------------------------------------------------------------
export interface HeroContent {
  badge: string;
  h1a: string;
  hl: string;
  h1b: string;
  lead: string;
  rate: string;
  trustNote: string;
  img: string;
}

export interface PricingContent {
  label: string;
  current: number;
  old: number;
  currency: string;
}

export interface AboutContent {
  badge: string;
  eyebrow: string;
  title: string;
  p1: string;
  p2: string;
  founderName: string;
  founderLogo: string;
}

export interface VideoContent {
  eyebrow: string;
  title: string;
  desc: string;
  caption: string;
  poster: string;
}

export interface SeoContent {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  author: string;
  robots: string;
  siteUrl: string;
  ogImage: string;
  ogType: string;
  ogLocale: string;
  twitterCard: string;
  indexable: boolean;
}

export interface SiteInfoContent {
  brandName: string;
  tagline: string;
  whatsappMain: string;
  phoneDisplay: string;
  email: string;
  address: string;
  hoursStore: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  privacyPolicySlug?: string;
  termsSlug?: string;
  cookiesSlug?: string;
}

// ---------------------------------------------------------------------------
// Collections (database tables)
// ---------------------------------------------------------------------------
export interface Testimonial {
  id: string;
  name: string;
  city: string;
  initials: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  sort_order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

export interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  col_span: number;
  is_active: boolean;
  sort_order: number;
}

export interface Oil {
  id: string;
  display_num: string;
  image_url: string;
  name: string;
  latin_name: string;
  points: string[];
  tag: string;
  is_active: boolean;
  sort_order: number;
}

export interface StatItem {
  id: string;
  count_value: number;
  prefix: string;
  suffix: string;
  label: string;
  is_active: boolean;
  sort_order: number;
}

export interface TrustBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface PageFeature {
  feature_key: string;
  name: string;
  is_enabled: boolean;
  sort_order: number;
}

export interface FloatingButton {
  button_key: string;
  name: string;
  position: 'left' | 'right';
  is_enabled: boolean;
  sort_order: number;
}
