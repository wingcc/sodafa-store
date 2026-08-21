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
    { id: 'hero', name: 'البطل الرئيسي', description: 'Main hero section with promotional content', status: 'active', order: 0 },
    { id: 'stats', name: 'الإحصائيات', description: 'Animated statistics counters', status: 'active', order: 2 },
    { id: 'trust', name: 'الثقة', description: 'Trust badges showing payment and delivery options', status: 'active', order: 3 },
    { id: 'flash', name: 'العروض السريعة', description: 'Flash sale products countdown', status: 'inactive', order: 4 },
    { id: 'oils', name: 'الزيوت', description: 'Natural oils showcase', status: 'active', order: 5 },
    { id: 'benefits', name: 'المميزات', description: 'Serum benefits and features grid', status: 'active', order: 6 },
    { id: 'video', name: 'الفيديو', description: 'Promotional video section', status: 'active', order: 7 },
    { id: 'cases', name: 'قبل وبعد', description: 'Before and after results gallery', status: 'active', order: 8 },
    { id: 'about', name: 'من نحن', description: 'About the store and founder', status: 'active', order: 9 },
    { id: 'products', name: 'المنتجات', description: 'Featured products grid', status: 'inactive', order: 10 },
    { id: 'reviews', name: 'التقييمات', description: 'Customer reviews and testimonials', status: 'active', order: 11 },
    { id: 'faq', name: 'الأسئلة الشائعة', description: 'Frequently asked questions accordion', status: 'active', order: 12 },
    { id: 'order', name: 'طريقة الطلب', description: 'How to order steps', status: 'active', order: 13 },
    { id: 'cta', name: 'دعوة للعمل', description: 'Call to action banner', status: 'active', order: 14 },
    { id: 'store', name: 'المتجر', description: 'Store location and map', status: 'active', order: 15 },
    { id: 'footer', name: 'التذييل', description: 'Page footer', status: 'active', order: 16 },
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