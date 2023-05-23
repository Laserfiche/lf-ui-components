import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { ILfSelectable, ItemWithId, Selectable } from '@laserfiche/lf-ui-components/shared';
import { Subscription } from 'rxjs';
import { GridSelectionListDataSource } from './lf-selection-list-data-source';
import { ColumnDef, ColumnOrderBy, SelectedItemEvent } from './lf-selection-list-types';
import { COLUMN_MIN_WIDTH } from './resize-column.directive';

/** @internal */
export interface RepositoryBrowserData {
  columns: Record<string, string>;
}

const SELECT_COL: ColumnDef = {
  id: 'select',
  displayName: '',
  defaultWidth: '35px',
  minWidthPx: 35,
  resizable: false,
  sortable: false,
};

/** @internal */
@Component({
  selector: 'lf-selection-list-component',
  templateUrl: './lf-selection-list.component.html',
  styleUrls: ['./lf-selection-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LfSelectionListComponent implements AfterViewInit, OnDestroy {
  @Output() scrollChanged = new EventEmitter<undefined>();
  @Output() itemDoubleClicked = new EventEmitter<ItemWithId>();
  @Output() itemSelected = new EventEmitter<SelectedItemEvent>();
  @Output() itemFocused = new EventEmitter<ItemWithId>();
  @Output() refreshData: EventEmitter<void> = new EventEmitter<void>();

  @Input() itemSize: number = 42;
  private _pageSize: number = 50;
  @Input()
  set pageSize(value: number) {
    this._pageSize = value;
    if (this.dataSource) {
      this.dataSource.pageSize = value;
    }
  }
  get pageSize(): number {
    return this._pageSize;
  }

  @Input() listItemRef?: TemplateRef<unknown>;
  @Input() alwaysShowHeader?: boolean;
  @Input() set listItems(items: ILfSelectable[]) {
    this.items = items;
    if (this.dataSource) {
      if (this.dataSource.allData.length < 1 && items.length > 0) {
        this.setNewWidths();
      }
      this.dataSource.allData = this.items;
    }
  }

  private setNewWidths() {
    if (this._showHeader === true) {
      this.setInitialWidth();
    } else {
      this.setDefaultWidths();
    }
  }

  @Input() set uniqueIdentifier(key: string) {
    this._uniqueIdentifier = key;
  }

  @Input() set multipleSelection(value: boolean) {
    this._multipleSelectEnabled = value;
    this.selectable.multiSelectable = value;
  }
  get multipleSelection(): boolean {
    return this._multipleSelectEnabled;
  }

  @Input()
  get columnOrderBy(): ColumnOrderBy | undefined {
    return this._columnOrderBy;
  }
  set columnOrderBy(orderBy: ColumnOrderBy | undefined) {
    if (this.sort && orderBy?.columnId && this.allColumnDefs.find((c) => c.id === orderBy.columnId)) {
      this.sort.sort({ id: orderBy?.columnId, start: orderBy?.isDesc ? 'desc' : 'asc', disableClear: true });
      this._columnOrderBy = orderBy;
    } else {
      console.debug('Unable to set new sort header');
    }
  }

  @Input() set columns(cols: ColumnDef[]) {
    if (cols.length > 1 || this.alwaysShowHeader === true) {
      this._showHeader = true;
    } else {
      this._showHeader = false;
    }
    const toAdd: ColumnDef[] = [];
    if (this.multipleSelection) {
      toAdd.push(SELECT_COL);
    }
    this.allColumnDefs = toAdd.concat(cols);
    this.allColumnHeaders = this.allColumnDefs.map((col) => col.id);
    this.additionalColumnDefs = cols;
    this.ref.detectChanges();
    this.setNewWidths();
  }
  get columns(): ColumnDef[] {
    return this.additionalColumnDefs;
  }

  private setDefaultWidths() {
    const widths: string[] = [];
    this.allColumnDefs.forEach((col) => {
      widths.push(col.defaultWidth);
    });

    if (this.matTable) {
      this.matTable.nativeElement.style.width = '100%';
      const templateCOls = widths.join(' ');
      this.columnsWidth = templateCOls;
    }
    this.ref.detectChanges();
  }

  /** @internal */
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;
  /** @internal */
  @ViewChild('matTable', { read: ElementRef }) matTable?: ElementRef;
  /** @internal */
  @ViewChild(MatSort) sort?: MatSort;

  /** @internal */
  private additionalColumnDefs: ColumnDef[] = [];
  /** @internal */
  private _uniqueIdentifier?: string;
  /** @internal */
  private allSubscriptions?: Subscription;
  /** @internal */
  private _columnOrderBy: ColumnOrderBy | undefined;
  /** @internal */
  private selectable: Selectable = new Selectable();
  /** @internal */
  private _multipleSelectEnabled: boolean = false;

  /** @internal */
  allColumnHeaders?: string[];
  /** @internal */
  dataSource?: GridSelectionListDataSource;
  /** @internal */
  items: ILfSelectable[] = [];
  /** @internal */
  allColumnDefs: ColumnDef[] = [];
  /** @internal */
  columnsWidth: string | undefined;
  /** @internal */
  resizePosition: number = 0;
  /** @internal */
  _showHeader: boolean = false;
  /** @internal */
  currentFocusIndex: number = 0;

  /** @internal */
  constructor(
    /** @internal */
    private focusMonitor: FocusMonitor,
    private ref: ChangeDetectorRef
  ) {}

  /** @internal */
  ngAfterViewInit(): void {
    this.dataSource = new GridSelectionListDataSource(this.items, this.viewport!, this.itemSize, this._pageSize);
    const dataSourceSub = this.dataSource.checkForData.subscribe(() => {
      this.scrollChanged.emit();
    });
    const dataOffsetSub = this.dataSource.offsetChange.subscribe((offset) => {
      this.placeholderHeight = offset;
    });
    this.allSubscriptions?.add(dataSourceSub);
    this.allSubscriptions?.add(dataOffsetSub);

    if (this.columns.length > 1 || this.alwaysShowHeader === true) {
      this._showHeader = true;
    } else {
      this._showHeader = false;
    }
    if (this.viewport?.elementRef.nativeElement) {
      this.focusMonitor.monitor(this.viewport?.elementRef.nativeElement, true).subscribe((origin: FocusOrigin) => {
        if (!origin || document.activeElement?.nodeName.toLowerCase() === 'cdk-virtual-scroll-viewport') {
          this.itemFocused.emit(undefined);
        }
      });
    }
  }

  ngOnDestroy() {
    this.allSubscriptions?.unsubscribe();
    this.focusMonitor.stopMonitoring(this.viewport!.elementRef.nativeElement);
  }

  clearSelectedValues() {
    this.selectable.clearSelectedValues(this.items);
  }

  placeholderWhen(index: number, _: any) {
    return index === 0;
  }

  onCheckboxClicked(event: MouseEvent) {
    event.preventDefault();
  }

  focus() {
    this._focus();
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    const sortState: ColumnOrderBy = { columnId: sort.active, isDesc: sort.direction === 'desc' };
    this._columnOrderBy = sortState;
    this.refreshData.emit();
  }

  focusCurrentIndex() {
    if (this.currentFocusIndex >= this.items.length) {
      this.currentFocusIndex = 0;
    }
    if (!this.items[this.currentFocusIndex] || !this.items[this.currentFocusIndex]) {
      this.viewport?.scrollToIndex(this.currentFocusIndex);
    }
  }

  /** @internal */
  async onClickMatListOption(event: MouseEvent, option: ILfSelectable, index: number) {
    let target: HTMLElement | null = event.target as HTMLElement;
    let nodeName: string | undefined;
    while (target != null && nodeName !== 'lf-list-option-component' && nodeName !== 'mat-checkbox') {
      target = target.parentElement;
      nodeName = target?.nodeName.toLowerCase();
    }
    if (nodeName === 'mat-checkbox') {
      this.selectable.onItemClicked(event, option, this.items, true);
    } else {
      this.selectable.onItemClicked(event, option, this.items);
    }
    this.currentFocusIndex = index;
    this.ref.detectChanges();

    this.itemSelected.emit({ selected: option, selectedItems: this.selectable.selectedItems });
  }

  /** @internal */
  onDblClick(event: MouseEvent | KeyboardEvent, item: ILfSelectable) {
    if (item.isSelectable && !item.isSelected) {
      this.selectable.onItemClicked(event, item, this.items, true);
      this.itemSelected.emit({ selected: item, selectedItems: this.selectable.selectedItems });
    }
    this.itemDoubleClicked.emit(item.value);
  }

  /** @internal */
  async onItemKeyDown(event: KeyboardEvent, item: ILfSelectable) {
    if (
      event.key === ' ' ||
      event.key === 'Enter' ||
      (event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))
    ) {
      if (event.key === 'Enter') {
        this.selectable.onItemClicked(event, item, this.items);
        this.itemSelected.emit({ selected: item, selectedItems: this.selectable.selectedItems });
        this.onDblClick(event, item);
        return;
      }
      this.selectable.onItemClicked(
        event,
        item,
        this.items,
        false,
        event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      );
      this.itemSelected.emit({ selected: item, selectedItems: this.selectable.selectedItems });
    }
  }

  /** @internal */
  onItemKeyUp(event: KeyboardEvent, item: ILfSelectable) {
    if (event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      this.selectable.onItemClicked(
        event,
        item,
        this.items,
        false,
        event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      );
      this.itemSelected.emit({ selected: item, selectedItems: this.selectable.selectedItems });
    }
  }

  /** @internal */
  onFocused(index: number) {
    this.currentFocusIndex = index;
    this.itemFocused.emit(this.items[index]?.value);
  }

  /** @internal */
  onViewportKeyDown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
    }
    if (this.viewport == null) {
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const activeElement = document.activeElement;
      if (
        activeElement?.nodeName.toLowerCase() !== 'cdk-virtual-scroll-viewport' &&
        activeElement?.nodeName.toLowerCase() !== 'tr'
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (activeElement?.nodeName.toLowerCase() === 'cdk-virtual-scroll-viewport') {
        this.focusCurrentIndex();
        const ele = this.viewport.elementRef.nativeElement.querySelector(
          '#lf-row-' + this.currentFocusIndex
        ) as HTMLElement;
        (ele?.childNodes[0] as HTMLElement).focus();
      } else {
        const moveDirection = event.key === 'ArrowUp' ? -1 : 1;
        this.currentFocusIndex = this.currentFocusIndex + moveDirection;
        // Check if currentFocusIndex is out of bounds
        if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.items.length) {
          this.currentFocusIndex = this.currentFocusIndex - moveDirection;
        }
        const ele = this.viewport.elementRef.nativeElement.querySelector(
          '#lf-row-' + this.currentFocusIndex
        ) as HTMLElement;
        ele?.focus();
      }
      if (!this._checkRowInView(this.currentFocusIndex)) {
        // this way even if we scroll down we go back to the section we were
        this.viewport.scrollToIndex(this.currentFocusIndex);
      }
    }
  }

  setInitialWidth() {
    setTimeout(() => {
      if (this.allColumnDefs.length > 0) {
        const repositoryBrowserData: RepositoryBrowserData | undefined = this.getRepositoryBrowserData();
        const tableEl = this.matTable?.nativeElement;
        const widths: string[] = [];
        this.allColumnDefs.forEach((col) => {
          const columnWidth = repositoryBrowserData?.columns[col.id];
          if (columnWidth) {
            widths.push(columnWidth);
          } else {
            widths.push(col.defaultWidth);
          }
        });

        if (this.matTable) {
          const templateCOls = widths.join(' ');
          this.columnsWidth = templateCOls;
        }
        this.ref.detectChanges();

        const containerWidth = this.viewport?.elementRef.nativeElement.getBoundingClientRect().width;
        tableEl.style.width = containerWidth + 'px';
        this.ref.detectChanges();
        const widthsInPixel: string[] = [];

        this.allColumnDefs.forEach((col, index) => {
          const lastColumnWidthAuto = index === this.allColumnDefs.length - 1 && col.defaultWidth === 'auto';
          if (lastColumnWidthAuto) {
            widthsInPixel.push('auto');
          } else {
            const columnEls = Array.from(
              this.viewport!.elementRef.nativeElement.getElementsByClassName('mat-column-' + col.id)
            );
            const columnWidthOffset = Math.max(...columnEls.map((c) => (c as HTMLDivElement).offsetWidth));
            const minWidthPx = col.minWidthPx ?? COLUMN_MIN_WIDTH;
            const columnWidthInPixel =
              col.id !== 'select' ? Math.max(columnWidthOffset, minWidthPx) + 'px' : SELECT_COL.defaultWidth;
            widthsInPixel.push(columnWidthInPixel);
          }
        });

        if (this.matTable) {
          const templateCOls = widthsInPixel.join(' ');
          this.columnsWidth = templateCOls;
        }

        tableEl.style.width = 'fit-content';
        this.ref.detectChanges();
      }
    });
  }

  private getRepositoryBrowserData(): RepositoryBrowserData | undefined {
    if (this._uniqueIdentifier) {
      const repositoryBrowserData = window.localStorage.getItem(this._uniqueIdentifier);
      let asJSON: RepositoryBrowserData | undefined;
      if (repositoryBrowserData) {
        asJSON = JSON.parse(repositoryBrowserData);
      }
      return asJSON;
    } else {
      return undefined;
    }
  }

  async setSelectedNodesAsync(
    values: ILfSelectable[],
    checkForMoreDataCallback: () => Promise<ILfSelectable[] | undefined>,
    maxFetchIterations: number
  ): Promise<ILfSelectable[]> {
    this.selectable.callback = checkForMoreDataCallback;
    await this.selectable.setSelectedNodesAsync(values, this.items, maxFetchIterations);
    return this.selectable.selectedItems;
  }

  /** @internal */
  _computeRowId(index: number) {
    return 'lf-row-' + index;
  }

  /** @internal */
  _checkFocused(rowIndex: number) {
    return this.currentFocusIndex === rowIndex;
  }

  /** @internal */
  private _checkRowInView(currentFocusIndex: number) {
    // is there an easier way to do this? -- check if currentFocusIndex is in viewport indices (rendered might be greater than viewable?)
    if (this.viewport == null) {
      return;
    }
    const rowEle = document.querySelector('#lf-row-' + currentFocusIndex);
    if (rowEle === null) {
      return false;
    }
    const rowEleRect = rowEle.getBoundingClientRect();
    const scrollRect = this.viewport.elementRef.nativeElement.getBoundingClientRect();
    const belowTop = rowEleRect.top >= scrollRect.top + (this._showHeader ? this.itemSize : 0);
    const aboveBottom = rowEleRect.bottom <= scrollRect.bottom;
    return belowTop && aboveBottom;
  }

  /** @internal */
  private _focus(tries: number = 0) {
    if (tries >= 10) {
      return;
    }
    this.focusCurrentIndex();
    const ele = this.viewport?.elementRef.nativeElement.querySelector(
      '#lf-row-' + this.currentFocusIndex
    ) as HTMLElement;
    ele?.focus();
  }

  // column resizing

  placeholderHeight: number = 0;

  onColumnWidthChanges(width: number, index: number) {
    this.updateRepositoryBrowserData(width, index);
    this.setColumnWidthChanges(width, index);
  }

  private updateRepositoryBrowserData(width: number, index: number) {
    if (this._uniqueIdentifier) {
      let repoData: RepositoryBrowserData | undefined = this.getRepositoryBrowserData();
      const key = this.allColumnDefs[index].id;
      if (!repoData) {
        repoData = {
          columns: {},
        };
      }
      repoData.columns[key] = width + 'px';
      localStorage.setItem(this._uniqueIdentifier, JSON.stringify(repoData));
    } else {
      console.warn('Unable to save lf-selection-list column widths. Need to set uniqueIdentifier on lf-selection-list');
    }
  }

  setColumnWidthChanges(width: number, index: number) {
    const widths = this.columnsWidth ?? '';
    const widthsA = widths.split(' ');
    widthsA[index] = width + 'px';
    const stringWidths = widthsA.join(' ');
    this.columnsWidth = stringWidths;
    this.ref.detectChanges();
  }
}
