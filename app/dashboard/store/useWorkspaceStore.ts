'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WorkspaceId = 'dashboard' | 'analytics';

export interface WidgetLayout {
  id: string;
  visible: boolean;
  locked: boolean;
  colSpan: number;
  rowSpan: number;
  order: number;
}

interface WorkspaceState {
  dashboard: WidgetLayout[];
  analytics: WidgetLayout[];
  dashboardAutoAlign: boolean;
  analyticsAutoAlign: boolean;
  dashboardGridVisible: boolean;
  analyticsGridVisible: boolean;
  dashboardDensity: 'compact' | 'comfortable' | 'spacious';
  analyticsDensity: 'compact' | 'comfortable' | 'spacious';
  // Transient
  dashboardDraft: WidgetLayout[] | null;
  analyticsDraft: WidgetLayout[] | null;
  dashboardEditMode: boolean;
  analyticsEditMode: boolean;
  dashboardPreview: boolean;
  analyticsPreview: boolean;
  dashboardHistory: WidgetLayout[][];
  dashboardHistoryIndex: number;
  analyticsHistory: WidgetLayout[][];
  analyticsHistoryIndex: number;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setDashboard: (l: WidgetLayout[]) => void;
  setAnalytics: (l: WidgetLayout[]) => void;
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
  setGridVisible: (workspace: WorkspaceId, v: boolean) => void;
  setDensity: (workspace: WorkspaceId, v: 'compact' | 'comfortable' | 'spacious') => void;
  setPreview: (workspace: WorkspaceId, v: boolean) => void;
  updateWidget: (workspace: WorkspaceId, id: string, patch: Partial<WidgetLayout>) => void;
  reorderWorkspace: (workspace: WorkspaceId, orderedIds: string[]) => void;
  resetWorkspace: (workspace: WorkspaceId, defaults: WidgetLayout[]) => void;
  undo: (workspace: WorkspaceId) => void;
  redo: (workspace: WorkspaceId) => void;
  canUndo: (workspace: WorkspaceId) => boolean;
  canRedo: (workspace: WorkspaceId) => boolean;
}

// Helper: push new state to history, truncating any future entries
const pushToHistory = (
  get: () => WorkspaceState,
  set: (partial: any) => void,
  workspace: WorkspaceId,
  newState: WidgetLayout[]
) => {
  const isD = workspace === 'dashboard';
  const histKey = isD ? 'dashboardHistory' : 'analyticsHistory';
  const idxKey = isD ? 'dashboardHistoryIndex' : 'analyticsHistoryIndex';
  const hist = [...(get()[histKey] as WidgetLayout[][])];
  const idx = get()[idxKey] as number;
  // Truncate future entries (if user undid, then made new change)
  const truncated = hist.slice(0, idx + 1);
  truncated.push(newState.map(w => ({ ...w })));
  // Keep max 30 entries
  if (truncated.length > 30) truncated.shift();
  set({ [histKey]: truncated, [idxKey]: truncated.length - 1 } as any);
};

// Helper: get current draft or saved layouts
const getCurrent = (get: () => WorkspaceState, workspace: WorkspaceId): WidgetLayout[] => {
  const isD = workspace === 'dashboard';
  const draft = get()[isD ? 'dashboardDraft' : 'analyticsDraft'];
  return draft ?? get()[workspace];
};

// Helper: set draft (in edit mode) or saved (fallback)
const setDraftOrSaved = (
  get: () => WorkspaceState,
  set: (partial: any) => void,
  workspace: WorkspaceId,
  next: WidgetLayout[]
) => {
  const isD = workspace === 'dashboard';
  const editMode = isD ? get().dashboardEditMode : get().analyticsEditMode;
  const draftKey = isD ? 'dashboardDraft' : 'analyticsDraft';
  if (editMode) {
    set({ [draftKey]: next } as any);
  } else {
    set({ [workspace]: next } as any);
  }
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      dashboard: [],
      analytics: [],
      dashboardDraft: null,
      analyticsDraft: null,
      dashboardAutoAlign: true,
      analyticsAutoAlign: true,
      dashboardGridVisible: true,
      analyticsGridVisible: true,
      dashboardDensity: 'comfortable' as const,
      analyticsDensity: 'comfortable' as const,
      dashboardPreview: false,
      analyticsPreview: false,
      dashboardHistory: [],
      dashboardHistoryIndex: -1,
      analyticsHistory: [],
      analyticsHistoryIndex: -1,
      dashboardEditMode: false,
      analyticsEditMode: false,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setDashboard: (dashboard) => set({ dashboard }),
      setAnalytics: (analytics) => set({ analytics }),

      enterDashboardEdit: () => {
        const { dashboard, dashboardDraft } = get();
        if (dashboardDraft) return;
        const draft = dashboard.map(w => ({ ...w }));
        set({
          dashboardDraft: draft,
          dashboardEditMode: true,
          dashboardHistory: [draft.map(w => ({ ...w }))],
          dashboardHistoryIndex: 0,
          dashboardPreview: false,
        });
      },
      cancelDashboardEdit: () => set({ dashboardDraft: null, dashboardEditMode: false }),
      applyDashboardEdit: () => {
        const { dashboardDraft } = get();
        if (!dashboardDraft) { set({ dashboardEditMode: false }); return; }
        const validated = dashboardDraft.map(w => ({
          ...w,
          colSpan: Math.min(12, Math.max(3, w.colSpan)),
          rowSpan: Math.min(4, Math.max(1, w.rowSpan ?? 2)),
        }));
        set({ dashboard: validated, dashboardDraft: null, dashboardEditMode: false });
      },
      enterAnalyticsEdit: () => {
        const { analytics, analyticsDraft } = get();
        if (analyticsDraft) return;
        const draft = analytics.map(w => ({ ...w }));
        set({
          analyticsDraft: draft,
          analyticsEditMode: true,
          analyticsHistory: [draft.map(w => ({ ...w }))],
          analyticsHistoryIndex: 0,
          analyticsPreview: false,
        });
      },
      cancelAnalyticsEdit: () => set({ analyticsDraft: null, analyticsEditMode: false }),
      applyAnalyticsEdit: () => {
        const { analyticsDraft } = get();
        if (!analyticsDraft) { set({ analyticsEditMode: false }); return; }
        const validated = analyticsDraft.map(w => ({
          ...w,
          colSpan: Math.min(12, Math.max(3, w.colSpan)),
          rowSpan: Math.min(4, Math.max(1, w.rowSpan ?? 2)),
        }));
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
      setGridVisible: (workspace, v) => set({ [workspace === 'dashboard' ? 'dashboardGridVisible' : 'analyticsGridVisible']: v } as any),
      setDensity: (workspace, v) => set({ [workspace === 'dashboard' ? 'dashboardDensity' : 'analyticsDensity']: v } as any),
      setPreview: (workspace, v) => set({ [workspace === 'dashboard' ? 'dashboardPreview' : 'analyticsPreview']: v } as any),

      // --- Core mutations: mutate THEN push history ---
      updateWidget: (workspace, id, patch) => {
        const current = getCurrent(get, workspace);
        const next = current.map(w => (w.id === id ? { ...w, ...patch } : w));
        setDraftOrSaved(get, set, workspace, next);
        pushToHistory(get, set, workspace, next);
      },

      reorderWorkspace: (workspace, orderedIds) => {
        const current = getCurrent(get, workspace);
        const map = new Map(current.map(w => [w.id, w]));
        const reordered = orderedIds
          .map((id, idx) => { const w = map.get(id); return w ? { ...w, order: idx } : null; })
          .filter(Boolean) as WidgetLayout[];
        const remaining = current.filter(w => !orderedIds.includes(w.id));
        const next = [...reordered, ...remaining];
        setDraftOrSaved(get, set, workspace, next);
        pushToHistory(get, set, workspace, next);
      },

      resetWorkspace: (workspace, defaults) => {
        const next = defaults.map(d => ({ ...d }));
        setDraftOrSaved(get, set, workspace, next);
        pushToHistory(get, set, workspace, next);
      },

      undo: (workspace) => {
        const isD = workspace === 'dashboard';
        const draftKey = isD ? 'dashboardDraft' : 'analyticsDraft';
        const histKey = isD ? 'dashboardHistory' : 'analyticsHistory';
        const idxKey = isD ? 'dashboardHistoryIndex' : 'analyticsHistoryIndex';
        const idx = get()[idxKey] as number;
        const hist = get()[histKey] as WidgetLayout[][];
        if (idx > 0) {
          const prev = hist[idx - 1].map(w => ({ ...w }));
          set({ [draftKey]: prev, [idxKey]: idx - 1 } as any);
        }
      },

      redo: (workspace) => {
        const isD = workspace === 'dashboard';
        const draftKey = isD ? 'dashboardDraft' : 'analyticsDraft';
        const histKey = isD ? 'dashboardHistory' : 'analyticsHistory';
        const idxKey = isD ? 'dashboardHistoryIndex' : 'analyticsHistoryIndex';
        const idx = get()[idxKey] as number;
        const hist = get()[histKey] as WidgetLayout[][];
        if (idx < hist.length - 1) {
          const next = hist[idx + 1].map(w => ({ ...w }));
          set({ [draftKey]: next, [idxKey]: idx + 1 } as any);
        }
      },

      canUndo: (workspace) => {
        const idx = workspace === 'dashboard' ? get().dashboardHistoryIndex : get().analyticsHistoryIndex;
        return idx > 0;
      },
      canRedo: (workspace) => {
        const idx = workspace === 'dashboard' ? get().dashboardHistoryIndex : get().analyticsHistoryIndex;
        const hist = workspace === 'dashboard' ? get().dashboardHistory : get().analyticsHistory;
        return idx < hist.length - 1;
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
        dashboardGridVisible: s.dashboardGridVisible,
        analyticsGridVisible: s.analyticsGridVisible,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      migrate: (persisted: any, version) => {
        if (persisted && persisted.dashboard) {
          persisted.dashboard = persisted.dashboard.map((w: any) => ({
            ...w,
            rowSpan: w.id === 'quick-actions'
              ? Math.max(w.rowSpan ?? 2, 2)
              : (w.rowSpan ?? (w.id === 'kpi-grid' ? 2 : w.id === 'revenue-overview' ? 2 : 2)),
          }));
        }
        if (persisted && persisted.analytics) {
          persisted.analytics = persisted.analytics.map((w: any) => ({
            ...w,
            rowSpan: w.rowSpan ?? (w.id.includes('overview') ? 2 : w.id === 'product-analytics' ? 4 : 2),
          }));
        }
        if (persisted && !persisted.dashboardAutoAlign) {
          persisted.dashboardAutoAlign = true;
          persisted.analyticsAutoAlign = true;
        }
        if (persisted && persisted.dashboardGridVisible === undefined) {
          persisted.dashboardGridVisible = true;
          persisted.analyticsGridVisible = true;
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
