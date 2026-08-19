// app/dashboard/pages/store-manager/store-content/components/ContentEditor.tsx

'use client';

import { useState, useEffect } from 'react';
import { Eye, Edit3, Columns, Save, Copy, ExternalLink, Check, AlertCircle, FileText, Ruler, Monitor, Tablet, Smartphone } from 'lucide-react';
import { ContentPage } from '../types';

interface ContentEditorProps {
  page: ContentPage | null;
  onSave: (page: ContentPage) => void;
}

type ViewMode = 'edit' | 'preview' | 'split';

const PRESET_SIZES = {
  desktop: { width: 1200, height: 800, label: 'Desktop', icon: Monitor },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: Tablet },
  mobile: { width: 375, height: 812, label: 'Mobile', icon: Smartphone },
};

export default function ContentEditor({ page, onSave }: ContentEditorProps) {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [pageWidth, setPageWidth] = useState(768);
  const [pageHeight, setPageHeight] = useState(600);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSizeControls, setShowSizeControls] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setName(page.name);
      setSlug(page.slug);
      setContent(page.content);
      setStatus(page.status);
      setPageWidth(page.pageWidth || 768);
      setPageHeight(page.pageHeight || 600);
      setLastSaved(new Date(page.updatedAt));
    } else {
      setName('');
      setSlug('');
      setContent('');
      setStatus('draft');
      setPageWidth(768);
      setPageHeight(600);
      setLastSaved(null);
    }
    setError(null);
    setActivePreset(null);
  }, [page]);

  const applyPreset = (preset: 'desktop' | 'tablet' | 'mobile') => {
    const size = PRESET_SIZES[preset];
    setPageWidth(size.width);
    setPageHeight(size.height);
    setActivePreset(preset);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Page name is required.');
      return;
    }
    if (!content.trim()) {
      setError('Page content is required.');
      return;
    }

    setIsSaving(true);
    const slugValue = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    onSave({
      id: page?.id || '',
      name: name.trim(),
      slug: slugValue,
      content: content.trim(),
      status,
      pageWidth,
      pageHeight,
      updatedAt: new Date().toISOString(),
    });
    setLastSaved(new Date());
    setTimeout(() => setIsSaving(false), 400);
  };

  const copyUrl = () => {
    if (!page) return;
    const url = `${window.location.origin}/content/${page.slug}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a page or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Top Toolbar */}
      <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 bg-gray-50/50">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none transition-colors px-1 py-0.5 min-w-[120px]"
            placeholder="Page name"
          />
          <span className="text-xs text-gray-400">/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="text-sm bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none transition-colors px-1 py-0.5 min-w-[80px]"
            placeholder="slug"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'edit' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Edit"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'split' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Split"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'preview' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Preview"
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Device Preview Buttons */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => applyPreset('desktop')}
                className={`p-1.5 rounded-md transition-colors ${
                  activePreset === 'desktop' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Desktop"
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => applyPreset('tablet')}
                className={`p-1.5 rounded-md transition-colors ${
                  activePreset === 'tablet' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Tablet"
              >
                <Tablet size={16} />
              </button>
              <button
                onClick={() => applyPreset('mobile')}
                className={`p-1.5 rounded-md transition-colors ${
                  activePreset === 'mobile' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Mobile"
              >
                <Smartphone size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowSizeControls(!showSizeControls)}
            className={`p-1.5 rounded-md transition-colors ${
              showSizeControls ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Custom size"
          >
            <Ruler size={16} />
          </button>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <div className="flex items-center gap-0.5">
            <button
              onClick={copyUrl}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy URL"
            >
              {copySuccess ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
            <a
              href={`/content/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="Open page"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
          >
            <Save size={15} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Size Controls Panel */}
      {showSizeControls && (
        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-200 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Width:</label>
            <input
              type="number"
              value={pageWidth}
              onChange={(e) => {
                setPageWidth(Number(e.target.value));
                setActivePreset(null);
              }}
              min={200}
              max={1400}
              step={20}
              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Height:</label>
            <input
              type="number"
              value={pageHeight}
              onChange={(e) => {
                setPageHeight(Number(e.target.value));
                setActivePreset(null);
              }}
              min={200}
              max={1200}
              step={20}
              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-xs text-gray-400">px</span>
          </div>
          <button
            onClick={() => {
              setPageWidth(768);
              setPageHeight(600);
              setActivePreset(null);
            }}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            Reset to default
          </button>
          <span className="text-xs text-gray-400">
            {pageWidth} × {pageHeight} px
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Last saved */}
      {lastSaved && !error && (
        <div className="px-4 py-1 text-xs text-gray-400 bg-gray-50/50 border-b border-gray-100 flex justify-end">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'edit' && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50/30"
            placeholder="Write your content here. Supports HTML tags."
            spellCheck={false}
          />
        )}
        {viewMode === 'preview' && (
          <div className="h-full overflow-y-auto p-6 bg-gray-50/30 flex items-center justify-center">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-auto transition-all duration-300"
              style={{
                width: pageWidth,
                height: pageHeight,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        )}
        {viewMode === 'split' && (
          <div className="flex h-full">
            <div className="w-1/2 h-full border-r border-gray-200">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50/30"
                spellCheck={false}
              />
            </div>
            <div className="w-1/2 h-full overflow-y-auto p-4 bg-gray-50/30 flex items-center justify-center">
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-auto transition-all duration-300"
                style={{
                  width: pageWidth,
                  height: pageHeight,
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}