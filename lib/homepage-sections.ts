// lib/homepage-sections.ts
import { createClient } from '@/lib/supabase/client';

export interface HomepageSection {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  order: number;
  config?: Record<string, any>;
}

export function getFallbackSections(): HomepageSection[] {
  return [
    { id: 'hero', name: 'Hero Banner', description: 'Main hero section', status: 'active', order: 0 },
    { id: 'trust-badges', name: 'Trust Badges', description: 'Trust badges', status: 'active', order: 1 },
    { id: 'flash-sale', name: 'Flash Sale', description: 'Flash sale countdown', status: 'active', order: 2 },
    { id: 'products', name: 'Featured Products', description: 'Product grid', status: 'active', order: 3 },
    { id: 'about', name: 'About Us', description: 'About section', status: 'active', order: 4 },
    { id: 'how-to-order', name: 'How to Order', description: 'Steps', status: 'active', order: 5 },
    { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews', status: 'active', order: 6 },
    { id: 'store-visit', name: 'Store Visit', description: 'Store location', status: 'active', order: 7 },
  ];
}

export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return getFallbackSections();
    }

    if (data && data.length > 0) {
      return data;
    }
    return getFallbackSections();
  } catch (err) {
    console.error('Fetch error:', err);
    return getFallbackSections();
  }
}