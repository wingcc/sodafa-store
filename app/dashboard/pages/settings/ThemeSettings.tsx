// app/dashboard/pages/settings/ThemeSettings.tsx
import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { ThemeColors } from '@/lib/theme/colors';
import { useToast } from '@/lib/toast';

const ThemeSettings: React.FC = () => {
  const { colors, updateColors, resetColors } = useTheme();
  const { addToast } = useToast();

  const colorLabels: Record<keyof ThemeColors, string> = {
    darkGreen: 'Dark Green',
    mediumGreen: 'Medium Green',
    gold: 'Gold',
    cream: 'Cream',
    warmCream: 'Warm Cream',
    white: 'White',
  };

  const formatHex = (hex: string) => (hex.startsWith('#') ? hex : `#${hex}`);

  const handleReset = () => {
    resetColors();
    addToast('info', 'All colors reset to default values.', { title: 'Colors Reset' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Brand Colors</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Customize your brand colors across dashboard & storefront.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(colors).map(([key, value]) => {
          const colorKey = key as keyof ThemeColors;
          return (
            <div key={key} className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 capitalize">
                {colorLabels[colorKey] || key}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formatHex(value)}
                  onChange={(e) => updateColors({ [colorKey]: e.target.value })}
                  className="w-12 h-12 p-0 border-0 rounded-lg cursor-pointer"
                  aria-label={`Select ${colorLabels[colorKey] || key} color`}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const val = e.target.value;
                    const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
                    if (hexRegex.test(val) || val === '') {
                      const formatted = val.startsWith('#') ? val : `#${val}`;
                      updateColors({ [colorKey]: formatted });
                    }
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  placeholder="#000000"
                />
                <div
                  className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: value }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview */}
      <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
        <p className="text-xs font-medium text-gray-500 mb-3">Live Preview</p>
        <div className="flex flex-wrap gap-4 items-center">
          <div
            className="px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: colors.darkGreen, color: colors.white }}
          >
            Dark Green
          </div>
          <div
            className="px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: colors.mediumGreen, color: colors.cream }}
          >
            Medium Green
          </div>
          <div
            className="px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: colors.gold, color: colors.darkGreen }}
          >
            Gold
          </div>
          <div
            className="px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: colors.cream, color: colors.darkGreen }}
          >
            Cream
          </div>
          <div
            className="px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: colors.warmCream, color: colors.darkGreen }}
          >
            Warm Cream
          </div>
          <div
            className="px-4 py-2 rounded-lg text-xs font-bold border border-gray-200"
            style={{ background: colors.white, color: colors.darkGreen }}
          >
            White
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;