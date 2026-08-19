// app/dashboard/pages/store-manager/homepage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Layout, Edit2, GripVertical, Plus, Trash2 } from 'lucide-react';
import Badge from '@/app/dashboard/components/ui/Badge';
import RefreshButton from '@/app/dashboard/components/ui/RefreshButton';
import { useToast } from '@/lib/toast';
import { fetchHomepageSections, updateHomepageSection, reorderSections, deleteHomepageSection } from './services/homepageService';
import { HomepageSection } from './types';
import SectionEditorModal from './components/SectionEditorModal';

export default function HomepageManagement() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const loadSections = async () => {
    setLoading(true);
    try {
      const data = await fetchHomepageSections();
      setSections(data);
    } catch (error) {
      console.error('Load error:', error);
      addToast('error', 'Failed to load homepage sections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleRefresh = () => {
    loadSections();
    addToast('info', 'Homepage sections refreshed', { title: 'Refreshed' });
  };

  const handleSaveSection = async (updated: HomepageSection) => {
    try {
      // If new section (no id in existing list), assign order = max + 1
      const existing = sections.find(s => s.id === updated.id);
      if (!existing) {
        const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), -1);
        updated.order = maxOrder + 1;
      }
      await updateHomepageSection(updated);
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      addToast('success', `"${updated.name}" updated successfully`);
    } catch (error) {
      console.error('Save error:', error);
      addToast('error', 'Failed to update section.');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section? This action cannot be undone.')) return;
    try {
      await deleteHomepageSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      addToast('success', 'Section deleted successfully.');
    } catch (error) {
      console.error('Delete error:', error);
      addToast('error', 'Failed to delete section.');
    }
  };

  const handleReorder = async (dragIndex: number, hoverIndex: number) => {
    const reordered = [...sections];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(hoverIndex, 0, moved);
    setSections(reordered);
    try {
      await reorderSections(reordered.map((s, idx) => ({ id: s.id, order: idx })));
    } catch (error) {
      console.error('Reorder error:', error);
      addToast('error', 'Failed to reorder sections.');
      // Revert to original order
      await loadSections();
    }
  };

  const openEditor = (section?: HomepageSection) => {
    setEditingSection(section || null);
    setIsModalOpen(true);
  };

  const closeEditor = () => {
    setEditingSection(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#cda552] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Homepage Sections</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage sections and layout of your homepage ({sections.length} sections)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
          >
            <Plus size={14} />
            Add Section
          </button>
          <RefreshButton onRefresh={handleRefresh} size="md" variant="default" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {sections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No sections found. Click "Add Section" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-grab"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = parseInt(e.dataTransfer.getData('text/plain'));
                  if (from !== index) handleReorder(from, index);
                }}
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-gray-400 cursor-grab" />
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Layout size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{section.name}</p>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={section.status === 'active' ? 'success' : 'default'} size="sm" dot>
                    {section.status}
                  </Badge>
                  <button
                    onClick={() => openEditor(section)}
                    className="p-2 rounded-lg hover:bg-white text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SectionEditorModal
        isOpen={isModalOpen}
        onClose={closeEditor}
        section={editingSection}
        onSave={handleSaveSection}
        existingIds={sections.map((s) => s.id)}
      />
    </div>
  );
}