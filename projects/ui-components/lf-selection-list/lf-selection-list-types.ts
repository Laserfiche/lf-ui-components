import { ILfSelectable } from '@laserfiche/lf-ui-components/shared';

export interface ColumnOrderBy {
  columnId: string;
  isDesc: boolean;
}

export interface ColumnDef {
  id: string;
  displayName: string;
  defaultWidth: string;
  minWidthPx?: number;
  sortable?: boolean;
  resizable?: boolean;
}

/** @internal */
export interface SelectedItemEvent {
  selected: ILfSelectable;
  selectedItems: ILfSelectable[] | undefined;
}
