// app/dashboard/pages/store-manager/store-content/components/Sidebar.tsx

'use client';

import { useState } from 'react';
import { FileText, Plus, Trash2, Copy, ExternalLink, Check, Search } from 'lucide-react';
import Badge from '@/app/dashboard/components/ui/Badge';
import { ContentPage } from '../types';

interface SidebarProps {
  pages: ContentPage[];
  selectedId: string | null;
  onSelect: (page: ContentPage) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({ pages, selectedId, onSelect, onAdd, onDelete }: SidebarProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPages = pages.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/content/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Pages</h3>
          <button
            onClick={onAdd}
            className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
            title="Create new page"
          >
            <Plus size={18} />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pages..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filteredPages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            {searchTerm ? 'No matching pages' : 'No pages yet'}
          </div>
        ) : (
          filteredPages.map((page) => (
            <div
              key={page.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                selectedId === page.id
                  ? 'bg-purple-50 border border-purple-200 shadow-sm'
                  : 'hover:bg-white border border-transparent hover:border-gray-200'
              }`}
              onClick={() => onSelect(page)}
            >
              <FileText size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {page.name}
                  </span>
                  <Badge
                    variant={page.status === 'published' ? 'success' : page.status === 'draft' ? 'warning' : 'default'}
                    size="sm"
                   
                  >
                    {page.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-400 truncate">/{page.slug}</div>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyUrl(page.slug);
                  }}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                  title="Copy URL"
                >
                  {copiedId === page.slug ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
                <a
                  href={`/content/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                  title="Open page"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this page?')) onDelete(page.id);
                  }}
                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-white text-xs text-gray-400 flex justify-between">
        <span>{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
        <span>{filteredPages.length} shown</span>
      </div>
    </div>
  );
}