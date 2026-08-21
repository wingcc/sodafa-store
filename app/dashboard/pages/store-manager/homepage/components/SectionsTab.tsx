// app/dashboard/pages/store-manager/homepage/components/SectionsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Layout, Edit2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Badge from '@/app/dashboard/components/ui/Badge';
import RefreshButton from '@/app/dashboard/components/ui/RefreshButton';
import { useToast } from '@/lib/toast';
import {
  fetchHomepageSections,
  updateHomepageSection,
  reorderSections,
  deleteHomepageSection,
} from '../services/homepageService';
import { HomepageSection } from '../types';
import SectionEditorModal from './SectionEditorModal';

export default function SectionsTab() {
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
    let cancelled = false;
    fetchHomepageSections()
      .then((data) => {
        if (!cancelled) setSections(data);
      })
      .catch((error) => {
        console.error('Load error:', error);
        if (!cancelled) addToast('error', 'Failed to load homepage sections.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = () => {
    loadSections();
    addToast('info', 'Homepage sections refreshed', { title: 'Refreshed' });
  };

  const handleSaveSection = async (updated: HomepageSection) => {
    try {
      // If new section (no id in existing list), assign order = max + 1
      const existing = sections.find((s) => s.id === updated.id);
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

  // Quick enable/disable from the list row
  const handleToggleStatus = async (section: HomepageSection) => {
    const nextStatus = section.status === 'active' ? 'inactive' : 'active';
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, status: nextStatus } : s))
    );
    try {
      await updateHomepageSection({ ...section, status: nextStatus });
    } catch (error) {
      console.error('Toggle error:', error);
      addToast('error', 'Failed to update section status.');
      loadSections();
    }
  };

  // Move a section up/down by swapping orders with its neighbor
  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const reordered = [...sections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSections(reordered);

    try {
      await reorderSections(reordered.map((s, idx) => ({ id: s.id, order: idx })));
    } catch (error) {
      console.error('Reorder error:', error);
      addToast('error', 'Failed to reorder sections.');
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

  const enabledCount = sections.filter((s) => s.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Gradient banner — page sections frame */}
      <div className="bg-gradient-to-l from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">إدارة أقسام الصفحة</h3>
            <p className="text-emerald-50 text-sm">فعّل أو عطّل الأقسام، وأعِد ترتيبها حسب رغبتك</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-emerald-50">الأقسام المفعّلة</p>
            <p className="text-2xl font-bold">
              {enabledCount} / {sections.length}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">
            Manage sections and layout of your homepage ({sections.length} sections)
          </p>
          <Badge variant="purple" size="md" dot>
            {enabledCount} / {sections.length} active
          </Badge>
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
            No sections found. Click &quot;Add Section&quot; to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors ${
                  section.status !== 'active' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Move up / down */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-0.5 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === sections.length - 1}
                      className="p-0.5 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <span className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500">
                    {index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Layout size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{section.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{section.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Quick enable/disable */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(section)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                      section.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                    title={section.status === 'active' ? 'Disable section' : 'Enable section'}
                  >
                    <span
                      className={`inline-block h-4 w-4 mt-1 ml-1 rounded-full bg-white shadow transform transition-transform ${
                        section.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
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
