'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WorkspaceId = 'dashboard' | 'analytics';

export interface WidgetLayout {
  id: string;
  visible: boolean;
  locked: boolean;
  colSpan: number; // 3,6,9,12
  rowSpan: number; // 1-4 rows, independent from width
  order: number;
}

interface WorkspaceState {
  // Persisted
  dashboard: WidgetLayout[];
  analytics: WidgetLayout[];
  dashboardAutoAlign: boolean;
  analyticsAutoAlign: boolean;
  // Transient
  dashboardDraft: WidgetLayout[] | null;
  analyticsDraft: WidgetLayout[] | null;
  dashboardEditMode: boolean;
  analyticsEditMode: boolean;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setDashboard: (l: WidgetLayout[]) => void;
  setAnalytics: (l: WidgetLayout[]) => void;
  // Edit session
  enterDashboardEdit: () => void;
  cancelDashboardEdit: () => void;
  applyDashboardEdit: () => void;
  enterAnalyticsEdit: () => void;
  cancelAnalyticsEdit: () => void;
  applyAnalyticsEdit: () => void;
  toggleDashboardEdit: () => void;
  toggleAnalyticsEdit: () => void;
  setDashboardEdit: (v: boolean) => void;
  setAnalyticsEdit: (v: boolean) => void;
  setAutoAlign: (workspace: WorkspaceId, v: boolean) => void;
  // Draft-aware mutations
  updateWidget: (workspace: WorkspaceId, id: string, patch: Partial<WidgetLayout>) => void;
  reorderWorkspace: (workspace: WorkspaceId, orderedIds: string[]) => void;
  resetWorkspace: (workspace: WorkspaceId, defaults: WidgetLayout[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      dashboard: [],
      analytics: [],
      dashboardDraft: null,
      analyticsDraft: null,
      dashboardAutoAlign: true,
      analyticsAutoAlign: true,
      dashboardEditMode: false,
      analyticsEditMode: false,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setDashboard: (dashboard) => set({ dashboard }),
      setAnalytics: (analytics) => set({ analytics }),

      enterDashboardEdit: () => {
        const { dashboard, dashboardDraft } = get();
        if (dashboardDraft) return;
        // clone to draft
        set({ dashboardDraft: dashboard.map(w => ({ ...w })), dashboardEditMode: true });
      },
      cancelDashboardEdit: () => set({ dashboardDraft: null, dashboardEditMode: false }),
      applyDashboardEdit: () => {
        const { dashboardDraft } = get();
        if (!dashboardDraft) { set({ dashboardEditMode: false }); return; }
        const validated = dashboardDraft.map(w => ({ ...w, colSpan: Math.min(12, Math.max(3, w.colSpan)), rowSpan: Math.min(4, Math.max(1, (w as any).rowSpan ?? 2)) }));
        set({ dashboard: validated, dashboardDraft: null, dashboardEditMode: false });
      },
      enterAnalyticsEdit: () => {
        const { analytics, analyticsDraft } = get();
        if (analyticsDraft) return;
        set({ analyticsDraft: analytics.map(w => ({ ...w })), analyticsEditMode: true });
      },
      cancelAnalyticsEdit: () => set({ analyticsDraft: null, analyticsEditMode: false }),
      applyAnalyticsEdit: () => {
        const { analyticsDraft } = get();
        if (!analyticsDraft) { set({ analyticsEditMode: false }); return; }
        const validated = analyticsDraft.map(w => ({ ...w, colSpan: Math.min(12, Math.max(3, w.colSpan)), rowSpan: Math.min(4, Math.max(1, (w as any).rowSpan ?? 2)) }));
        set({ analytics: validated, analyticsDraft: null, analyticsEditMode: false });
      },

      toggleDashboardEdit: () => {
        const { dashboardEditMode } = get();
        if (dashboardEditMode) get().cancelDashboardEdit();
        else get().enterDashboardEdit();
      },
      toggleAnalyticsEdit: () => {
        const { analyticsEditMode } = get();
        if (analyticsEditMode) get().cancelAnalyticsEdit();
        else get().enterAnalyticsEdit();
      },
      setDashboardEdit: (v) => {
        if (v) get().enterDashboardEdit();
        else get().cancelDashboardEdit();
      },
      setAnalyticsEdit: (v) => {
        if (v) get().enterAnalyticsEdit();
        else get().cancelAnalyticsEdit();
      },
      setAutoAlign: (workspace, v) =>
        set({ [workspace === 'dashboard' ? 'dashboardAutoAlign' : 'analyticsAutoAlign']: v } as any),

      updateWidget: (workspace, id, patch) => {
        const isDashboard = workspace === 'dashboard';
        const editMode = isDashboard ? get().dashboardEditMode : get().analyticsEditMode;
        const draftKey = isDashboard ? 'dashboardDraft' : 'analyticsDraft';
        const savedKey = workspace;
        if (editMode) {
          const draft = get()[draftKey] as WidgetLayout[] | null;
          if (draft) {
            const next = draft.map(w => (w.id === id ? { ...w, ...patch } : w));
            set({ [draftKey]: next } as any);
            return;
          }
        }
        // fallback to saved (outside edit or no draft)
        set((s) => ({
          [savedKey]: (s as any)[savedKey].map((w: WidgetLayout) => (w.id === id ? { ...w, ...patch } : w)),
        } as any));
      },
      reorderWorkspace: (workspace, orderedIds) => {
        const isDashboard = workspace === 'dashboard';
        const editMode = isDashboard ? get().dashboardEditMode : get().analyticsEditMode;
        const draftKey = isDashboard ? 'dashboardDraft' : 'analyticsDraft';
        const savedKey = workspace;
        const source = editMode ? (get()[draftKey] as WidgetLayout[] | null) : null;
        if (editMode && source) {
          const map = new Map(source.map(w => [w.id, w]));
          const reordered = orderedIds.map((id, idx) => ({ ...map.get(id)!, order: idx }));
          const remaining = source.filter(w => !orderedIds.includes(w.id));
          const next = [...reordered, ...remaining];
          // AutoAlign: when enabled, compact by reordering visible only, hidden stay at end
          set({ [draftKey]: next } as any);
          return;
        }
        set((s) => {
          const arr = (s as any)[savedKey] as WidgetLayout[];
          const map = new Map(arr.map((w: WidgetLayout) => [w.id, w]));
          const reordered = orderedIds.map((id, idx) => ({ ...map.get(id)!, order: idx }));
          const remaining = arr.filter((w: WidgetLayout) => !orderedIds.includes(w.id));
          return { [savedKey]: [...reordered, ...remaining] } as any;
        });
      },
      resetWorkspace: (workspace, defaults) => {
        const isDashboard = workspace === 'dashboard';
        const editMode = isDashboard ? get().dashboardEditMode : get().analyticsEditMode;
        const draftKey = isDashboard ? 'dashboardDraft' : 'analyticsDraft';
        if (editMode) {
          set({ [draftKey]: defaults.map(d => ({ ...d })) } as any);
        } else {
          set({ [workspace]: defaults.map(d => ({ ...d })) } as any);
        }
      },
    }),
    {
      name: 'workspace-layouts-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        dashboard: s.dashboard,
        analytics: s.analytics,
        dashboardAutoAlign: s.dashboardAutoAlign,
        analyticsAutoAlign: s.analyticsAutoAlign,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      migrate: (persisted: any, version) => {
        if (persisted && persisted.dashboard) {
          persisted.dashboard = persisted.dashboard.map((w: any) => ({ ...w, rowSpan: w.rowSpan ?? (w.id === 'kpi-grid' ? 2 : w.id === 'revenue-overview' ? 2 : w.id === 'quick-actions' ? 1 : 2) }));
        }
        if (persisted && persisted.analytics) {
          persisted.analytics = persisted.analytics.map((w: any) => ({ ...w, rowSpan: w.rowSpan ?? (w.id.includes('overview') ? 2 : w.id === 'product-analytics' ? 4 : 2) }));
        }
        if (persisted && !persisted.dashboardAutoAlign) {
          persisted.dashboardAutoAlign = true;
          persisted.analyticsAutoAlign = true;
        }
        try {
          const v1 = localStorage.getItem('workspace-layouts-v1');
          const v2 = localStorage.getItem('workspace-layouts-v2');
          const src = v2 || v1;
          if (src && (!persisted.dashboard || !persisted.dashboard.length)) {
            const parsed = JSON.parse(src);
            if (parsed.state?.dashboard) persisted.dashboard = parsed.state.dashboard.map((w: any) => ({ ...w, rowSpan: w.rowSpan ?? 2 }));
            if (parsed.state?.analytics) persisted.analytics = parsed.state.analytics.map((w: any) => ({ ...w, rowSpan: w.rowSpan ?? 2 }));
          }
        } catch {}
        return persisted;
      },
      version: 3,
    }
  )
);
