// app/dashboard/pages/settings/ThemeSettings.tsx
import React from 'react';
import { RotateCcw, Sun, Moon, Languages, Palette, Check, Sparkles, Eye } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import type { ThemeColors } from '@/lib/theme/colors';
import { useToast } from '@/lib/toast';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { useTranslation } from '../../i18n/useTranslation';
import { PALETTES, getPalette } from '@/lib/theme/palettes';
import { applyDashboardPalettes } from '@/lib/theme/cssVariables';

const ThemeSettings: React.FC = () => {
  const { colors, updateColors, resetColors } = useTheme();
  const { addToast } = useToast();
  const { theme, toggleTheme, language, toggleLanguage, lightPaletteId, darkPaletteId, setLightPalette, setDarkPalette } = usePreferencesStore();
  const { t } = useTranslation();

  const colorLabels: Record<keyof ThemeColors, string> = {
    darkGreen: 'Dark Green',
    mediumGreen: 'Medium Green',
    gold: 'Gold (Accent)',
    cream: 'Cream',
    warmCream: 'Warm Cream',
    white: 'White',
  };

  const formatHex = (hex: string) => (hex.startsWith('#') ? hex : `#${hex}`);

  const handleReset = () => {
    resetColors();
    // also reset palettes to defaults (SSS Emerald)
    setLightPalette('emerald');
    setDarkPalette('emerald');
    const light = getPalette('emerald');
    const dark = getPalette('emerald');
    applyDashboardPalettes(light, dark);
    updateColors(light.brand);
    addToast('info', 'All colors and palettes reset to SSS Emerald defaults.', { title: 'Reset Complete' });
  };

  const handleLightPalette = (id: string) => {
    const pal = getPalette(id);
    setLightPalette(id);
    const darkPal = getPalette(darkPaletteId);
    applyDashboardPalettes(pal, darkPal);
    if (theme === 'light') {
      updateColors(pal.brand);
    }
    addToast('success', `${pal.name} set for Light mode.`, { title: 'Light Palette' });
  };

  const handleDarkPalette = (id: string) => {
    const pal = getPalette(id);
    setDarkPalette(id);
    const lightPal = getPalette(lightPaletteId);
    applyDashboardPalettes(lightPal, pal);
    if (theme === 'dark') {
      updateColors(pal.brand);
    }
    addToast('success', `${pal.name} set for Dark mode.`, { title: 'Dark Palette' });
  };

  const handleApplyBoth = (id: string) => {
    const pal = getPalette(id);
    setLightPalette(id);
    setDarkPalette(id);
    applyDashboardPalettes(pal, pal);
    updateColors(pal.brand);
    addToast('success', `${pal.name} applied to both Light & Dark.`, { title: 'Palette Applied' });
  };

  const lightActive = lightPaletteId;
  const darkActive = darkPaletteId;

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Appearance</h3>
          <p className="text-sm text-gray-500 mt-0.5">Toggle theme & language. Palettes below are separate for Light and Dark.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                {theme === 'dark' ? <Moon size={16} className="text-[#0a2c23]" /> : <Sun size={16} className="text-amber-500" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{theme === 'dark' ? t('header.theme.dark') : t('header.theme.light')}</p>
                <p className="text-xs text-gray-500">{theme === 'dark' ? 'Dark uses Dark palette' : 'Light uses Light palette'}</p>
              </div>
            </div>
            <button onClick={toggleTheme} className="px-4 py-2 rounded-xl text-sm font-medium bg-[#0a2c23] text-white hover:bg-[#0f3d31] transition-colors">
              {theme === 'dark' ? t('common.light') : t('common.dark')}
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center"><Languages size={16} /></div>
              <div><p className="text-sm font-medium text-gray-900">{language === 'ar' ? t('common.arabic') : t('common.english')}</p><p className="text-xs text-gray-500">{language === 'ar' ? 'RTL + Tajawal' : 'LTR + Inter'}</p></div>
            </div>
            <button onClick={toggleLanguage} className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-gold,#d97706)] text-white hover:opacity-90 transition-opacity">{language === 'ar' ? 'EN' : 'AR'}</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 border text-center ${theme === 'light' ? 'ring-2 ring-[var(--color-gold,#d97706)]/30' : ''}`} style={{ background: 'var(--dashboard-bg-light, #f8f6f3)', borderColor: 'var(--dashboard-card-border-light, #ece3d4)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--color-darkGreen, #0a2c23)' }}>Light — {getPalette(lightActive).name}</p>
            <div className="mt-2 h-8 rounded-lg shadow-sm mx-auto w-3/4" style={{ background: 'var(--dashboard-card-light, #fff)', border: '1px solid var(--dashboard-card-border-light)' }} />
          </div>
          <div className={`rounded-xl p-3 border text-center ${theme === 'dark' ? 'ring-2 ring-[var(--color-gold,#d97706)]/30' : ''}`} style={{ background: 'var(--dashboard-bg-dark, #0f1411)', borderColor: 'var(--dashboard-card-border-dark)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--color-gold, #d97706)' }}>Dark — {getPalette(darkActive).name}</p>
            <div className="mt-2 h-8 rounded-lg shadow mx-auto w-3/4" style={{ background: 'var(--dashboard-card-dark, #1a2320)', border: '1px solid var(--dashboard-card-border-dark)' }} />
          </div>
        </div>
      </div>

      {/* Light Mode Palette */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600"><Sun size={16} /></div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Light Mode Palette</h3>
              <p className="text-xs text-gray-500">Applies when theme is Light. Click to set.</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700">{PALETTES.length} options</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PALETTES.map((pal) => {
            const active = lightActive === pal.id;
            return (
              <button key={`light-${pal.id}`} onClick={() => handleLightPalette(pal.id)} className={`text-left p-3 rounded-xl border transition-all ${active ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-200' : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{language === 'ar' ? pal.nameAr : pal.name}</p>
                  {active && <span className="w-5 h-5 rounded-full bg-amber-500 text-white grid place-items-center"><Check size={12} /></span>}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{language === 'ar' ? pal.descriptionAr : pal.description}</p>
                <div className="flex gap-1.5 mt-2.5 p-2 rounded-lg" style={{ background: pal.light.bg, border: `1px solid ${pal.light.cardBorder}` }}>
                  <span className="flex-1 h-6 rounded-md shadow-sm" style={{ background: pal.light.card, border: `1px solid ${pal.light.cardBorder}` }} />
                  <span className="w-6 h-6 rounded-full border border-black/10" style={{ background: pal.accent }} title="Accent (active states, buttons)" />
                  <span className="w-6 h-6 rounded-full border border-black/10" style={{ background: pal.brand.darkGreen }} title="Primary" />
                  <span className="w-6 h-6 rounded-full border border-black/10" style={{ background: pal.brand.mediumGreen }} title="Secondary" />
                </div>
                <div className="flex gap-1 mt-2 text-[10px] text-gray-400">
                  <span>Accent</span>
                  <span>·</span>
                  <span>Primary</span>
                  <span>·</span>
                  <span>Secondary</span>
                </div>
                <div className="flex gap-1 mt-2 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono" style={{ color: pal.brand.darkGreen }}>{pal.light.bg}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono">→ {pal.light.card}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dark Mode Palette */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-300"><Moon size={16} /></div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Dark Mode Palette</h3>
              <p className="text-xs text-gray-500">Applies when theme is Dark. Each has deep surfaces.</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">{PALETTES.length} options</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PALETTES.map((pal) => {
            const active = darkActive === pal.id;
            return (
              <button key={`dark-${pal.id}`} onClick={() => handleDarkPalette(pal.id)} className={`text-left p-3 rounded-xl border transition-all ${active ? 'border-slate-700 bg-slate-900 ring-1 ring-amber-300/30' : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-900'}`} style={active ? { color: '#fff' } : {}}>{language === 'ar' ? pal.nameAr : pal.name}</p>
                  {active && <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 grid place-items-center"><Check size={12} /></span>}
                </div>
                <p className={`text-[11px] mt-0.5 line-clamp-1 ${active ? 'text-white/60' : 'text-gray-500'}`}>{language === 'ar' ? pal.descriptionAr : pal.description}</p>
                <div className="flex gap-1.5 mt-2.5 p-2 rounded-lg" style={{ background: pal.dark.bg, border: `1px solid ${pal.dark.cardBorder}` }}>
                  <span className="flex-1 h-6 rounded-md shadow" style={{ background: pal.dark.card, border: `1px solid ${pal.dark.cardBorder}` }} />
                  <span className="w-6 h-6 rounded-full border border-white/10" style={{ background: pal.accent }} title="Accent (active states, buttons)" />
                  <span className="w-6 h-6 rounded-full border border-white/10" style={{ background: pal.brand.darkGreen }} title="Primary" />
                  <span className="w-6 h-6 rounded-full border border-white/10" style={{ background: pal.brand.mediumGreen }} title="Secondary" />
                </div>
                <div className={`flex gap-1 mt-2 text-[10px] ${active ? 'text-white/40' : 'text-gray-400'}`}>
                  <span>Accent</span>
                  <span>·</span>
                  <span>Primary</span>
                  <span>·</span>
                  <span>Secondary</span>
                </div>
                <div className="flex gap-1 mt-2 text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded border font-mono ${active ? 'bg-white/10 text-white border-white/10' : 'bg-white border-gray-200 text-gray-600'}`}>{pal.dark.bg}</span>
                  <span className={`px-1.5 py-0.5 rounded border font-mono ${active ? 'bg-white/10 text-white border-white/10' : 'bg-white border-gray-200 text-gray-600'}`}>→ {pal.dark.card}</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1"><Eye size={12} /> Tip: Toggle <Moon size={10} className="inline" /> Dark from header to see dark palette live.</p>
      </div>

      {/* Quick Apply Both */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Apply palette to both modes</p>
            <p className="text-xs text-gray-500">One click mirrors the same palette for Light & Dark</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PALETTES.slice(0, 6).map((pal) => (
            <button key={`both-${pal.id}`} onClick={() => handleApplyBoth(pal.id)} title={`Apply ${pal.name} to both`} className="w-8 h-8 rounded-full border-2 border-white shadow hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${pal.light.bg} 50%, ${pal.dark.bg} 50%)`, borderColor: pal.accent }} />
          ))}
        </div>
      </div>

      {/* Brand Colors fine-tune */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Brand Colors — Fine Tune</h3>
            <p className="text-sm text-gray-500 mt-0.5">Overrides the palette’s brand tokens. Stored in <code className="px-1 py-0.5 bg-gray-50 rounded text-xs">app_brand_colors</code></p>
          </div>
          <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"><RotateCcw size={14} /> Reset All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(colors).map(([key, value]) => {
            const colorKey = key as keyof ThemeColors;
            return (
              <div key={key} className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 capitalize">{colorLabels[colorKey] || key}</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={formatHex(value)} onChange={(e) => updateColors({ [colorKey]: e.target.value })} className="w-12 h-12 p-0 border-0 rounded-lg cursor-pointer shrink-0" />
                  <input type="text" value={value} onChange={(e) => { const val = e.target.value; const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/; if (hexRegex.test(val) || val === '') { const formatted = val.startsWith('#') ? val : `#${val}`; updateColors({ [colorKey]: formatted }); } }} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold,#d97706)]/20" placeholder="#000000" />
                  <div className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0" style={{ backgroundColor: value }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border" style={{ background: 'var(--dashboard-bg-light, #f8f6f3)', borderColor: 'var(--dashboard-card-border-light)' }}>
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-darkGreen)' }}>Light — {getPalette(lightActive).name}</p>
            <div className="flex gap-2 flex-wrap"><span className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm" style={{ background: colors.darkGreen, color: colors.white }}>DarkGreen</span><span className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm" style={{ background: colors.gold, color: colors.darkGreen }}>Gold</span><span className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-white" style={{ color: colors.darkGreen }}>Card</span></div>
          </div>
          <div className="p-3 rounded-xl border" style={{ background: 'var(--dashboard-bg-dark, #0f1411)', borderColor: 'var(--dashboard-card-border-dark)' }}>
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-gold)' }}>Dark — {getPalette(darkActive).name}</p>
            <div className="flex gap-2 flex-wrap"><span className="px-3 py-1.5 rounded-lg text-xs font-bold border" style={{ background: 'var(--dashboard-card-dark)', color: '#eef2ee', borderColor: 'var(--dashboard-card-border-dark)' }}>Card</span><span className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: colors.gold, color: '#0f1411' }}>Gold</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
