import { createClient } from '@/lib/supabase/client';
import { HomepageSection } from '../types';

const supabase = createClient();

// Fallback mock data (used if database fetch fails)
const MOCK_SECTIONS: HomepageSection[] = [
  { id: 'hero', name: 'Hero Banner', description: 'Main hero section', status: 'active', order: 0 },
  { id: 'trust-badges', name: 'Trust Badges', description: 'Trust badges', status: 'active', order: 1 },
  { id: 'flash-sale', name: 'Flash Sale', description: 'Flash sale countdown', status: 'active', order: 2 },
  { id: 'products', name: 'Featured Products', description: 'Product grid', status: 'active', order: 3 },
  { id: 'about', name: 'About Us', description: 'About section', status: 'active', order: 4 },
  { id: 'how-to-order', name: 'How to Order', description: 'Steps', status: 'active', order: 5 },
  { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews', status: 'active', order: 6 },
  { id: 'store-visit', name: 'Store Visit', description: 'Store location', status: 'active', order: 7 },
];

export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  try {
    console.log('Fetching homepage sections from Supabase...');
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return MOCK_SECTIONS;
    }

    if (data && data.length > 0) {
      console.log('Sections loaded from DB:', data);
      return data;
    }

    console.warn('No data found in DB, using mock data.');
    return MOCK_SECTIONS;
  } catch (err) {
    console.error('Failed to fetch sections:', err);
    return MOCK_SECTIONS;
  }
}

export async function updateHomepageSection(section: HomepageSection): Promise<void> {
  const { error } = await supabase
    .from('homepage_sections')
    .upsert({
      id: section.id,
      name: section.name,
      description: section.description,
      status: section.status,
      order: section.order,
      config: section.config,
    }, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function reorderSections(updates: { id: string; order: number }[]): Promise<void> {
  for (const update of updates) {
    const { error } = await supabase
      .from('homepage_sections')
      .update({ order: update.order })
      .eq('id', update.id);
    if (error) throw new Error(error.message);
  }
}

export async function deleteHomepageSection(id: string): Promise<void> {
  const { error } = await supabase
    .from('homepage_sections')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}