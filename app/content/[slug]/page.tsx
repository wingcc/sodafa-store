// app/content/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { Navbar } from '@/app/sections/Navbar';
import { Footer } from '@/app/sections/Footer';
import { AnnouncementBar } from '@/app/sections/AnnouncementBar';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaticContentPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = createAdminClient();
  const { data: page, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !page) {
    notFound();
  }

  const width = page.page_width || 768;
  const height = page.page_height || 600;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div
            className="bg-white rounded-2xl shadow-lg border border-stone-200/80 p-6 md:p-10 lg:p-12 overflow-auto"
            style={{
              width: `${width}px`,
              maxWidth: '100%',
              minHeight: `${height}px`,
            }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">{page.name}</h1>
            <div
              className="prose prose-stone max-w-none prose-headings:font-bold prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-amber-600 hover:prose-a:text-amber-800"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
            <div className="mt-8 pt-6 border-t border-stone-200 text-sm text-stone-400 flex items-center justify-between">
              <span>Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
              <span className="text-xs uppercase tracking-wider text-stone-300">Page</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}