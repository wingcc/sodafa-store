'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Check, X, Package, Tag, Users, Loader2 } from 'lucide-react';
import Modal from './Modal';

type EntityType = 'products' | 'categories' | 'customers';

interface Entity {
  id: string;
  name: string;
  subtitle?: string;
  image?: string;
}

interface EntityPickerModalProps {
  open: boolean;
  onClose: () => void;
  type: EntityType;
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}

const endpointMap: Record<EntityType, string> = {
  products: '/api/products?status=active&limit=200',
  categories: '/api/categories?status=active&limit=200',
  customers: '/api/customers?limit=200',
};

const iconMap: Record<EntityType, React.ReactNode> = {
  products: <Package size={16} />,
  categories: <Tag size={16} />,
  customers: <Users size={16} />,
};

const labelMap: Record<EntityType, string> = {
  products: 'Products',
  categories: 'Categories',
  customers: 'Customers',
};

export default function EntityPickerModal({
  open,
  type,
  selectedIds: initialSelected,
  onConfirm,
  onClose,
}: EntityPickerModalProps) {
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(initialSelected));
    setSearch('');
    setLoading(true);

    fetch(endpointMap[type])
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data ?? json.categories ?? json.products ?? json.customers ?? [];
        const mapped: Entity[] = rows.map((r: any) => ({
          id: r.id,
          name: r.name ?? r.code ?? r.title ?? 'Unnamed',
          subtitle:
            type === 'products'
              ? `${r.sku ?? ''}${r.regular_price != null ? ` · ${r.regular_price} MAD` : ''}`
              : type === 'categories'
              ? `${r.product_count ?? 0} products`
              : r.email ?? r.phone ?? '',
          image: r.images?.[0]?.src ?? r.images?.[0] ?? r.image ?? r.avatar ?? null,
        }));
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open, type, initialSelected.join(',')]);

  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.subtitle ?? '').toLowerCase().includes(q)
    );
  });

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm text-gray-500">
        {selected.size} selected
      </span>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm(Array.from(selected));
            onClose();
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all"
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={`Select ${labelMap[type]}`} size="lg" footer={footer}>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${labelMap[type].toLowerCase()} by name or ID...`}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
          autoFocus
        />
      </div>

      {/* Select All */}
      {filtered.length > 0 && (
        <button
          onClick={toggleAll}
          className="w-full text-left text-sm text-purple-600 hover:text-purple-700 font-medium mb-2 px-1"
        >
          {selected.size === filtered.length ? 'Deselect all' : `Select all (${filtered.length})`}
        </button>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 size={24} className="animate-spin text-purple-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No {labelMap[type].toLowerCase()} found</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filtered.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-purple-50 border border-purple-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check size={12} className="text-white" />}
                </div>

                {/* Image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                </div>

                {/* ID */}
                <span className="text-[10px] text-gray-400 font-mono flex-shrink-0 truncate max-w-[100px]">
                  {item.id}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
