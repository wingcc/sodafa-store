import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const supabase = createAdminClient();

  try {
    if (slug) {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabase
      .from('content_pages')
      .select('slug,name,content,status,updated_at')
      .eq('status', 'published')
      .order('name', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err?.message ?? 'Failed' } }, { status: 500 });
  }
}
