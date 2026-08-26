// app/dashboard/pages/settings/ToastSettings.tsx
import React from 'react';
import { useToastSettings } from '@/lib/toast/ToastSettingsContext';
import { RotateCcw } from 'lucide-react';

const POSITION_OPTIONS = [
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
];

const ToastSettings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useToastSettings();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Toast Notifications</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Customize how notifications appear across the app.
          </p>
        </div>
        <button
          onClick={resetSettings}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
          <select
            value={settings.position}
            onChange={(e) => updateSettings({ position: e.target.value as any })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen)]/20 focus:border-[var(--color-darkGreen)]/50 transition-all"
          >
            {POSITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Duration (ms): <span className="font-mono">{settings.duration}</span>
          </label>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={settings.duration}
            onChange={(e) => updateSettings({ duration: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-darkGreen)]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1s</span>
            <span>5s</span>
            <span>10s</span>
          </div>
        </div>

        {/* Auto Dismiss Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div>
            <p className="text-sm font-medium text-gray-900">Auto Dismiss</p>
            <p className="text-xs text-gray-500">Automatically close toasts after duration</p>
          </div>
          <button
            onClick={() => updateSettings({ autoDismiss: !settings.autoDismiss })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.autoDismiss ? 'bg-[var(--color-darkGreen)]' : 'bg-gray-200'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.autoDismiss ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>

        {/* Show Progress Bar */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div>
            <p className="text-sm font-medium text-gray-900">Progress Bar</p>
            <p className="text-xs text-gray-500">Display a progress bar on toasts</p>
          </div>
          <button
            onClick={() => updateSettings({ showProgress: !settings.showProgress })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.showProgress ? 'bg-[var(--color-darkGreen)]' : 'bg-gray-200'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.showProgress ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>

        {/* Max Toasts */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Max Visible Toasts: <span className="font-mono">{settings.maxToasts}</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={settings.maxToasts}
            onChange={(e) => updateSettings({ maxToasts: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-darkGreen)]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastSettings;
