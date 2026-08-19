// app/dashboard/pages/store-manager/store-content/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast';
import { ContentPage } from './types';
import { fetchContentPages, createContentPage, updateContentPage, deleteContentPage } from './services/contentService';
import Sidebar from './components/Sidebar';
import ContentEditor from './components/ContentEditor';

export default function StoreContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const { addToast } = useToast();

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await fetchContentPages();
      setPages(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
        setEditingPage(data[0]);
      }
    } catch (error) {
      addToast('error', 'Failed to load content pages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedId) {
      const page = pages.find((p) => p.id === selectedId);
      setEditingPage(page || null);
    } else {
      setEditingPage(null);
    }
  }, [selectedId, pages]);

  const handleSelect = (page: ContentPage) => setSelectedId(page.id);

  const handleAdd = () => {
    setEditingPage({
      id: '',
      name: 'Untitled Page',
      slug: 'untitled',
      content: '<h1>New Page</h1><p>Start writing your content here...</p>',
      status: 'draft',
      pageWidth: 768,
      pageHeight: 600,
      updatedAt: new Date().toISOString(),
    });
    setSelectedId(null);
  };

  const handleSave = async (page: ContentPage) => {
    try {
      if (page.id) {
        // Update existing page – include pageWidth and pageHeight
        const updated = await updateContentPage(page.id, {
          name: page.name,
          slug: page.slug,
          content: page.content,
          status: page.status,
          pageWidth: page.pageWidth,
          pageHeight: page.pageHeight,
        });
        setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setSelectedId(updated.id);
        addToast('success', `"${updated.name}" updated`);
      } else {
        // Create new page – include pageWidth and pageHeight
        const created = await createContentPage({
          name: page.name,
          slug: page.slug,
          content: page.content,
          status: page.status,
          pageWidth: page.pageWidth,
          pageHeight: page.pageHeight,
        });
        setPages((prev) => [...prev, created]);
        setSelectedId(created.id);
        addToast('success', `"${created.name}" created`);
      }
    } catch (error) {
      addToast('error', 'Failed to save page.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContentPage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) {
        const remaining = pages.filter((p) => p.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
      addToast('success', 'Page deleted');
    } catch (error) {
      addToast('error', 'Failed to delete page.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#cda552] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading content pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex h-full">
        <Sidebar
          pages={pages}
          selectedId={selectedId}
          onSelect={handleSelect}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
        <ContentEditor page={editingPage} onSave={handleSave} />
      </div>
    </div>
  );
}