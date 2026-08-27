'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkspaceId = 'dashboard' | 'analytics';

export interface WidgetLayout {
  id: string;
  visible: boolean;
  locked: boolean;
  colSpan: number; // 3,6,9,12 mapped to 1-4 cols on 12-col grid
  order: number;
}

interface WorkspaceState {
  dashboard: WidgetLayout[];
  analytics: WidgetLayout[];
  dashboardEditMode: boolean;
  analyticsEditMode: boolean;
  setDashboard: (layouts: WidgetLayout[]) => void;
  setAnalytics: (layouts: WidgetLayout[]) => void;
  toggleDashboardEdit: () => void;
  toggleAnalyticsEdit: () => void;
  setDashboardEdit: (v: boolean) => void;
  setAnalyticsEdit: (v: boolean) => void;
  updateWidget: (workspace: WorkspaceId, id: string, patch: Partial<WidgetLayout>) => void;
  reorderWorkspace: (workspace: WorkspaceId, orderedIds: string[]) => void;
  resetWorkspace: (workspace: WorkspaceId, defaults: WidgetLayout[]) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      dashboard: [],
      analytics: [],
      dashboardEditMode: false,
      analyticsEditMode: false,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setDashboard: (dashboard) => set({ dashboard }),
      setAnalytics: (analytics) => set({ analytics }),
      toggleDashboardEdit: () => set({ dashboardEditMode: !get().dashboardEditMode }),
      toggleAnalyticsEdit: () => set({ analyticsEditMode: !get().analyticsEditMode }),
      setDashboardEdit: (v) => set({ dashboardEditMode: v }),
      setAnalyticsEdit: (v) => set({ analyticsEditMode: v }),
      updateWidget: (workspace, id, patch) =>
        set((s) => ({
          [workspace]: s[workspace].map((w) => (w.id === id ? { ...w, ...patch } : w)),
        } as Partial<WorkspaceState>)),
      reorderWorkspace: (workspace, orderedIds) =>
        set((s) => {
          const map = new Map(s[workspace].map((w) => [w.id, w]));
          const reordered = orderedIds.map((id, idx) => ({ ...map.get(id)!, order: idx }));
          const remaining = s[workspace].filter((w) => !orderedIds.includes(w.id));
          return { [workspace]: [...reordered, ...remaining] } as Partial<WorkspaceState>;
        }),
      resetWorkspace: (workspace, defaults) => set({ [workspace]: defaults } as Partial<WorkspaceState>),
    }),
    {
      name: 'workspace-layouts-v1',
      partialize: (s) => ({ dashboard: s.dashboard, analytics: s.analytics }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
