export interface WidgetMeta {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  defaultVisible: boolean;
  defaultColSpan: number; // 3,6,9,12
  minColSpan?: number;
  maxColSpan?: number;
  lockedByDefault?: boolean;
}
