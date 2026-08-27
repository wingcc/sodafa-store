export interface WidgetMeta {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  defaultVisible: boolean;
  defaultColSpan: number; // 3,6,9,12
  defaultRowSpan: number; // 1-4
  minColSpan?: number;
  maxColSpan?: number;
  minRowSpan?: number;
  maxRowSpan?: number;
  lockedByDefault?: boolean;
}
