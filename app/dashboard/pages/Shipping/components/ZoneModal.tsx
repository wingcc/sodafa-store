// Zone editor modal — create/update a zone, select existing cities via search autocomplete.

import { useState, useMemo } from 'react';
import { X, Search, MapPin } from 'lucide-react';
import type { ShippingCity } from '../../../types';

interface SelectedCity {
  id: string;
  name: string;
  nameAr: string;
}

interface ZoneModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: { name: string; description: string; city_ids: string[] }) => Promise<void>;
  onAdvanced: () => void;
  title: string;
  initial?: { name: string; description: string; cities: SelectedCity[] } | null;
  isSaving: boolean;
  allCities: ShippingCity[];
}

const ZoneModal = ({ open, onClose, onSave, onAdvanced, title, initial, isSaving, allCities }: ZoneModalProps) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>(initial?.cities ?? []);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync if initial changes (e.g. switching from add to edit)
  if (initial && initial.name !== name && !selectedCities.length) {
    setName(initial.name);
    setDescription(initial.description);
    setSelectedCities(initial.cities);
  }

  const selectedIds = useMemo(() => new Set(selectedCities.map((c) => c.id)), [selectedCities]);

  // Filter suggestions: match search, exclude already selected
  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return allCities
      .filter((c) => !selectedIds.has(c.id))
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameAr.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [search, allCities, selectedIds]);

  const addCity = (city: ShippingCity) => {
    setSelectedCities((prev) => [...prev, { id: city.id, name: city.name, nameAr: city.nameAr }]);
    setSearch('');
    setShowSuggestions(false);
  };

  const removeCity = (id: string) => {
    setSelectedCities((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      description: description.trim(),
      city_ids: selectedCities.map((c) => c.id),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-stone-200 flex-shrink-0">
            <h3 className="text-lg font-bold text-stone-900">{title}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 text-stone-500">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body — name + description + selected badges */}
          <div className="overflow-y-auto p-5 space-y-5 flex-1 min-h-0">
            {/* Zone name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Zone Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Grand Casablanca"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            {/* Selected cities badges */}
            {selectedCities.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2">
                  {selectedCities.length} cit{selectedCities.length !== 1 ? 'ies' : 'y'} selected
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCities.map((city) => (
                    <span
                      key={city.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 text-sm text-stone-700"
                    >
                      <MapPin size={12} className="text-[#0b2e22]" />
                      {city.name}
                      <button
                        type="button"
                        onClick={() => removeCity(city.id)}
                        className="ml-0.5 p-0.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search + Add Cities — OUTSIDE scrollable to avoid overflow clipping */}
          <div className="px-5 pb-3 flex-shrink-0">
            <label className="block text-sm font-medium text-stone-700 mb-1">Add Cities</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2e22]/20 focus:border-[#0b2e22]"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search cities by name..."
              />

              {/* Suggestions dropdown — extends DOWN into footer area, no overflow clipping */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {suggestions.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addCity(city)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-stone-50 transition-colors"
                    >
                      <MapPin size={14} className="text-stone-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-stone-800">{city.name}</div>
                        {city.nameAr && (
                          <div className="text-xs text-stone-400">{city.nameAr}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results hint */}
              {showSuggestions && search.trim() && suggestions.length === 0 && (
                <div className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-xl p-3 text-center">
                  <p className="text-xs text-stone-400">No cities found matching &ldquo;{search}&rdquo;</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-stone-200 flex-shrink-0">
            <button
              type="button"
              onClick={onAdvanced}
              className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors"
            >
              Advanced Settings
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-50 transition-colors"
                style={{ background: 'linear-gradient(135deg, #0b2e22 0%, #061c16 100%)' }}
              >
                {isSaving ? 'Saving...' : initial?.name ? 'Save Changes' : 'Add Zone'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZoneModal;
