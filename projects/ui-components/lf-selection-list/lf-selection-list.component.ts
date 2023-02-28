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
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { ILfSelectable, ItemWithId, Selectable } from '@laserfiche/lf-ui-components/shared';
import { Subscription } from 'rxjs';
import { GridTableDataSource, ROW_HEIGHT } from './lf-selection-list-data-source';
import { ColumnDef, ColumnOrderBy, SelectedItemEvent } from './lf-selection-list-types';

/** @internal */
export interface RepositoryBrowserData {
  columns: Record<string, string>;
}

/** @internal */
@Component({
  selector: 'lf-selection-list-component',
  templateUrl: './lf-selection-list.component.html',
  styleUrls: ['./lf-selection-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LfSelectionListComponent implements AfterViewInit, OnDestroy {
  /** @internal */
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;
  @ViewChild('matTable', { read: ElementRef }) matTable?: ElementRef;
  @Input() itemSize: number = 42;
  @Input() listItemRef?: TemplateRef<unknown>;
  private additionalColumnDefs: ColumnDef[] = [];
  allColumnHeaders?: string[];
  /** @internal */
  items: ILfSelectable[] = [];
  columnOrderBy?: ColumnOrderBy;
  @Output() refreshData: EventEmitter<void> = new EventEmitter<void>();
  columnMinWidth: number = 100;
  selectWidth: number = 0;
  selectColumnDef: ColumnDef = { id: 'select', displayName: '', defaultWidth: '50px' };
  nameColumnDef: ColumnDef = { id: 'name', displayName: 'Name', defaultWidth: 'auto' };
  allColumnDefs: ColumnDef[] = [];
  _localStorageKey: string = '';
  firstResize: boolean = true;
  offSetSub?: Subscription;
  columnsWidth: string | undefined;
  resizePosition: number = 0;
  resizedColumnInitialOffsetLeft: number = 0;

  @Input() set listItems(items: ILfSelectable[]) {
    this.items = items;
    if (this.dataSource) {
      if (this.dataSource.allData.length < 1 && items.length > 0) {
        this.setInitialWidth();
      }
      this.dataSource.allData = this.items;
    }
  }

  @Input() set uniqueIdentifier(key: string) {
    this._localStorageKey = key;
  }

  placeholderWhen(index: number, _: any) {
    return index == 0;
  }

  @Input() set multipleSelection(value: boolean) {
    this._multipleSelectEnabled = value;
    this.selectable.multiSelectable = value;
    this.selectWidth = value ? 50 : 0;
  }
  get multipleSelection(): boolean {
    return this._multipleSelectEnabled;
  }

  @Input() set columns(cols: ColumnDef[]) {
    this.firstResize = true;
    const nameColumnDef = cols.find((col) => col.id === 'name');
    const toAdd: ColumnDef[] = [];
    if (nameColumnDef) {
      if (this.multipleSelection) {
        toAdd.push(this.selectColumnDef);
      }
    } else {
      if (this.multipleSelection) {
        toAdd.push(this.selectColumnDef, this.nameColumnDef);
      } else {
        toAdd.push(this.nameColumnDef);
      }
    }
    this.allColumnDefs = toAdd.concat(cols);
    this.allColumnHeaders = this.allColumnDefs.map((col) => col.id);
    this.additionalColumnDefs = cols;
    this.ref.detectChanges();
    this.setInitialWidth();
  }
  get columns(): ColumnDef[] {
    // be able to get all column defs with calculated columns
    return this.additionalColumnDefs;
  }

  dataSource?: GridTableDataSource;
  @Output() scrollChanged = new EventEmitter<undefined>();
  @Output() itemDoubleClicked = new EventEmitter<ItemWithId>();
  @Output() itemSelected = new EventEmitter<SelectedItemEvent>();
  @Output() itemFocused = new EventEmitter<ItemWithId>();

  /** @internal */
  currentFocusIndex: number = 0;

  /** @internal */
  protected selectable: Selectable = new Selectable();
  /** @internal */
  private _multipleSelectEnabled: boolean = false;
  @ViewChild(MatSort) sort?: MatSort;

  /** @internal */
  constructor(
    /** @internal */
    private focusMonitor: FocusMonitor,
    private ref: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  /** @internal */
  ngAfterViewInit(): void {
    this.dataSource = new GridTableDataSource(this.items, this.viewport!, this.itemSize);
    this.ref.detectChanges();
    this.offSetSub = this.dataSource.offsetChange.subscribe((offset) => {
      this.placeholderHeight = offset;
    });

    if (this.viewport?.elementRef.nativeElement) {
      this.focusMonitor.monitor(this.viewport?.elementRef.nativeElement, true).subscribe((origin: FocusOrigin) => {
        if (!origin || document.activeElement?.nodeName.toLowerCase() === 'cdk-virtual-scroll-viewport') {
          this.itemFocused.emit(undefined);
        }
      });
    }
  }

  onCheckboxClicked(event: MouseEvent) {
    event.preventDefault();
  }
  ngOnDestroy() {
    this.offSetSub?.unsubscribe();
    this.focusMonitor.stopMonitoring(this.viewport!.elementRef.nativeElement);
  }

  clearSelectedValues() {
    this.selectable.clearSelectedValues(this.items);
  }

  focus() {
    this._focus();
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    const sortState: ColumnOrderBy = { columnId: sort.active, isDesc: sort.direction === 'desc' };
    this.columnOrderBy = sortState;
    this.refreshData.emit();
  }
  // When the table content gets focused we check to see if we need to reset the currentFocusIndex
  // we do this by checking to see if it is larger than the list
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
    // TODO not focusing

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
  onScroll(event: number) {
    if (this.viewport == null) {
      console.error('Viewport was not defined when onScroll was called');
      return;
    }
    // If the viewport is at the end we should try and pull more data
    const end = event + 10;
    const total = this.items.length ? this.items.length - 1 : 0;
    if ((total > 0 && end === total) || end > total) {
      this.scrollChanged.emit();
    }
  }

  /** @internal */
  onFocused(index: number) {
    this.currentFocusIndex = index;
    // TODO this is
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
        // TODO this dorsn't work  whrn multiple components on page
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
      const asJSON = this.getLocalStorageData();
      const tableEl = Array.from(
        this.viewport!.elementRef.nativeElement.getElementsByClassName('lf-table-selection-list')
      );
      const containerWidth = this.viewport?.elementRef.nativeElement.getBoundingClientRect().width;
      (tableEl[0] as HTMLTableElement).style.width = containerWidth + 'px';
      this.ref.detectChanges();
      const widths: string[] = [];
      this.allColumnDefs.forEach((col) => {
        const columnWidth = asJSON?.columns[col.id];
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
      const widthsInPixel: string[] = [];
      this.allColumnDefs.forEach((col) => {
        const columnEls = Array.from(
          this.viewport!.elementRef.nativeElement.getElementsByClassName('mat-column-' + col.id)
        );
        const columnWidthInPixel = (columnEls[0] as HTMLDivElement).offsetWidth + 'px';
        widthsInPixel.push(columnWidthInPixel);
      });

      if (this.matTable) {
        const templateCOls = widthsInPixel.join(' ');
        this.columnsWidth = templateCOls;
      }

      (tableEl[0] as HTMLTableElement).style.width = 'fit-content';
      this.ref.detectChanges();
    });
  }

  private getLocalStorageData(): RepositoryBrowserData | undefined {
    const repositoryBrowserData = window.localStorage.getItem(this._localStorageKey);
    let asJSON: RepositoryBrowserData | undefined;
    if (repositoryBrowserData) {
      asJSON = JSON.parse(repositoryBrowserData);
    }
    return asJSON;
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
    const belowTop = rowEleRect.top >= scrollRect.top + ROW_HEIGHT; // need to include header row in height
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
  pressed: boolean = false;
  startWidth?: number;
  startX?: number;
  resizableMousemove?: () => void;
  resizableMouseup?: () => void;

  onResizeColumn(ev: MouseEvent, index: number) {
    if (!this.viewport) {
      return;
    }
    if (this.firstResize) {
      const currentStyle = this.columnsWidth;
      const currentWidths: string[] = currentStyle!.split(' ');
      let repoData: RepositoryBrowserData | undefined = this.getLocalStorageData();
      if (!repoData) {
        repoData = { columns: {} };
      }
      this.allColumnDefs.forEach((colDef, i) => {
        const columnElements = this.viewport!.elementRef.nativeElement.getElementsByClassName(
          'mat-column-' + this.allColumnDefs[i].id
        );

        const currentWidth = (columnElements![0] as HTMLElement).offsetWidth;
        currentWidths[i] = currentWidth + 'px';
        repoData!.columns[colDef.id] = currentWidth + 'px';
      });
      const colWidths = currentWidths.join(' ');
      this.columnsWidth = colWidths;

      localStorage.setItem(this._localStorageKey, JSON.stringify(repoData));
    }
    this.firstResize = false;
    ev.preventDefault();
    ev.stopPropagation();
    this.pressed = true;
    this.startX = ev.pageX;
    this.resizePosition =
      ev.clientX -
      this.viewport.elementRef.nativeElement.getBoundingClientRect().left +
      this.viewport.elementRef.nativeElement.scrollLeft;
    this.ref.detectChanges();
    const columnElement = this.viewport!.elementRef.nativeElement.getElementsByClassName(
      'mat-column-' + this.allColumnDefs[index].id
    );
    this.startWidth = (columnElement![0] as HTMLElement).offsetWidth;
    this.resizedColumnInitialOffsetLeft = (columnElement![0] as any).offsetLeft;
    this.mouseMove(index);
  }

  mouseMove(index: number) {
    this.resizableMousemove = this.renderer.listen('document', 'mousemove', (event: MouseEvent) => {
      if (!this.viewport) {
        return;
      }
      if (this.pressed && event.buttons) {
        const currentPositionWithScroll =
          event.clientX -
          this.viewport.elementRef.nativeElement.getBoundingClientRect().left +
          this.viewport.elementRef.nativeElement.scrollLeft;
        if (currentPositionWithScroll - this.resizedColumnInitialOffsetLeft > this.columnMinWidth) {
          this.resizePosition = currentPositionWithScroll;
          this.ref.detectChanges();
        } else {
          this.resizePosition = this.resizedColumnInitialOffsetLeft + this.columnMinWidth;
          this.ref.detectChanges();
        }
      }
    });
    this.resizableMouseup = this.renderer.listen('document', 'mouseup', (event) => {
      if (this.pressed) {
        this.pressed = false;
        const width = this.resizePosition - this.resizedColumnInitialOffsetLeft;
        this.setColumnWidthChanges(index, width);
        let repoData: RepositoryBrowserData | undefined = this.getLocalStorageData();
        const key = this.allColumnDefs[index].id;
        if (!repoData) {
          repoData = {
            columns: {},
          };
        }
        repoData.columns[key] = width + 'px';
        localStorage.setItem(this._localStorageKey, JSON.stringify(repoData));
        if (this.resizableMousemove) this.resizableMousemove();
        if (this.resizableMouseup) this.resizableMouseup();
      }
    });
  }

  setColumnWidthChanges(index: number, width: number) {
    const widths = this.columnsWidth ?? '';
    const widthsA = widths.split(' ');
    widthsA[index] = width + 'px';
    const stringWidths = widthsA.join(' ');
    this.columnsWidth = stringWidths;
    this.ref.detectChanges();
  }
}
