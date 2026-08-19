// app/dashboard/pages/store-manager/store-content/services/contentService.ts

import { createClient } from '@/lib/supabase/client';
import { ContentPage } from '../types';

const supabase = createClient();

export async function fetchContentPages(): Promise<ContentPage[]> {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data?.map((row) => ({
    ...row,
    pageWidth: row.page_width || 768,
    pageHeight: row.page_height || 600,
  })) || [];
}

export async function fetchContentPageById(id: string): Promise<ContentPage> {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    pageWidth: data.page_width || 768,
    pageHeight: data.page_height || 600,
  };
}

export async function updateContentPage(
  id: string,
  updates: Partial<Omit<ContentPage, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ContentPage> {
  const { data, error } = await supabase
    .from('content_pages')
    .update({
      name: updates.name,
      slug: updates.slug,
      content: updates.content,
      status: updates.status,
      page_width: updates.pageWidth,
      page_height: updates.pageHeight,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    pageWidth: data.page_width || 768,
    pageHeight: data.page_height || 600,
  };
}

export async function createContentPage(
  page: Omit<ContentPage, 'id' | 'updatedAt'>
): Promise<ContentPage> {
  const { data, error } = await supabase
    .from('content_pages')
    .insert({
      name: page.name,
      slug: page.slug || page.name.toLowerCase().replace(/\s+/g, '-'),
      content: page.content,
      status: page.status,
      page_width: page.pageWidth || 768,
      page_height: page.pageHeight || 600,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    pageWidth: data.page_width || 768,
    pageHeight: data.page_height || 600,
  };
}

export async function deleteContentPage(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_pages')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}