import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
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
  ViewChild,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { ILfSelectable, ItemWithId, Selectable } from '@laserfiche/lf-ui-components/shared';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

export interface ColumnOrderBy {
  columnId: string;
  isDesc: boolean;
}

export interface ColumnDef {
  id: string;
  displayName: string;
  defaultWidth: string;
}

/** @internal */
export interface SelectedItemEvent {
  selected: ILfSelectable;
  selectedItems: ILfSelectable[] | undefined;
}

export interface RepositoryBrowserData {
  columns: Record<string, string>;
}

const PAGESIZE = 20;
const ROW_HEIGHT = 42;

export class GridTableDataSource extends DataSource<any> {
  private _data: any[];
  indexChangeSub: Subscription;
  curStart: number = 0;

  get allData(): ILfSelectable[] {
    return this._data.slice();
  }

  set allData(data: ILfSelectable[]) {
    const existingData = this._data;
    this._data = data;
    this.viewport.setTotalContentSize(this.itemSize * this._data.length);
    if (!existingData || existingData.length === 0) {
      this.resetView();
    }
  }

  private resetView() {
    this.visibleData.next(this._data.slice(0, PAGESIZE));
    this.viewport.scrollTo({ top: 0 });
  }

  offset = 0;
  offsetChange = new BehaviorSubject(0);

  constructor(initialData: ILfSelectable[], private viewport: CdkVirtualScrollViewport, private itemSize: number) {
    super();
    this._data = initialData;
    this.viewport.setTotalContentSize(this.itemSize * initialData.length);
    this.visibleData.next(this._data.slice(0, PAGESIZE));

    this.indexChangeSub = this.viewport.scrolledIndexChange.subscribe((li) => {
      const slicedData = this._data.slice(li, li + PAGESIZE);
      this.curStart = li;
      this.visibleData.next(slicedData);
      this.offsetChange.next(li * ROW_HEIGHT);
    });
  }

  private readonly visibleData: BehaviorSubject<ILfSelectable[]> = new BehaviorSubject<ILfSelectable[]>([]);

  connect(collectionViewer: CollectionViewer): Observable<any[] | ReadonlyArray<any>> {
    return this.visibleData;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.indexChangeSub.unsubscribe();
  }
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
  private additionalColumnDefs: ColumnDef[] = [];
  allColumnHeaders?: string[];
  /** @internal */
  items: ILfSelectable[] = [];
  columnOrderBy?: ColumnOrderBy;
  @Output() refreshData: EventEmitter<void> = new EventEmitter<void>();
  columnMinWidth: number = 100;
  selectWidth: number = 0;
  selectColumnDef: ColumnDef = { id: 'select', displayName: '', defaultWidth: '50px' };
  nameColumnDef: ColumnDef = { id: 'name', displayName: 'Name', defaultWidth: '30%' };
  allColumnDefs: ColumnDef[] = [];
  previousWidth: number = 0;
  _containerWidth: number = 0;
  _localStorageKey: string = '';
  firstResize: boolean = true;
  offSetSub?: Subscription;
  columnsWidth: string | undefined;
  resizePosition: number = 0;
  resizedColumnInitialOffsetLeft: number = 0;

  @Input() set listItems(items: ILfSelectable[]) {
    this.items = items;
    if (this.dataSource) {
      this.dataSource.allData = this.items;
    }
    this.setInitialWidth();
  }

  @Input() set uniqueIdentifier(key: string) {
    this._localStorageKey = key;
  }

  placeholderWhen(index: number, _: any) {
    return index == 0;
  }

  @Input() set containerWidth(value: number) {
    this._containerWidth = value;
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
    const toAdd: ColumnDef[] = this.multipleSelection
      ? [this.selectColumnDef, this.nameColumnDef]
      : [this.nameColumnDef];
    // only add name column if it's not in there??
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
    // Check the local store based on ids
    if (!this.viewport) {
      return;
    }
    let asJSON = this.getLocalStorageData();
    const tableEl = Array.from(
      this.viewport!.elementRef.nativeElement.getElementsByClassName('lf-table-selection-list')
    );
    (tableEl[0] as HTMLTableElement).style.width = this._containerWidth + 'px';
    this.ref.detectChanges();
    const widths: string[] = [];
    this.allColumnDefs.forEach((col) => {
      const columnWidth = asJSON?.columns[col.id];
      if (columnWidth) {
        widths.push(columnWidth);
      } else {
        widths.push(col.defaultWidth);
      }

      const columnEls = Array.from(
        this.viewport!.elementRef.nativeElement.getElementsByClassName('mat-column-' + col.id)
      );
    });

    if (this.matTable) {
      const templateCOls = widths.join(' ');
      this.columnsWidth = templateCOls;
    }

    // save the column width as pixels
    this.ref.detectChanges();
    setTimeout(() => {
      const widthsInPixel: string[] = [];
      this.allColumnDefs.forEach((col) => {
        const columnEls = Array.from(
          this.viewport!.elementRef.nativeElement.getElementsByClassName('mat-column-' + col.id)
        );
        const columnWidthInPixel = (columnEls[0] as HTMLDivElement).clientWidth + 'px';
        widthsInPixel.push(columnWidthInPixel);
      })

      if (this.matTable) {
        const templateCOls = widthsInPixel.join(' ');
        this.columnsWidth = templateCOls;
      }

      (tableEl[0] as HTMLTableElement).style.width = 'fit-content';
      this.ref.detectChanges();
    }, 0)
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

  /**
   * @internal
   * @param entry
   * @returns list of strings that represent img src's
   */
  getIcons(entry: any): string[] {
    return typeof entry.icon === 'string' ? [entry.icon] : entry.icon;
  }

  // column resizing

  placeholderHeight: number = 0;
  currentResizeIndex: number = -1;
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

        const currentWidth = columnElements![0].clientWidth;
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
    this.currentResizeIndex = index;
    this.pressed = true;
    this.startX = ev.pageX;
    this.resizePosition = ev.clientX - this.viewport.elementRef.nativeElement.getBoundingClientRect().left + this.viewport.elementRef.nativeElement.scrollLeft;
    this.ref.detectChanges();
    const columnElement = this.viewport!.elementRef.nativeElement.getElementsByClassName(
      'mat-column-' + this.allColumnDefs[index].id
    );
    this.startWidth = columnElement![0].clientWidth;
    this.previousWidth = this.startWidth;
    this.resizedColumnInitialOffsetLeft = (columnElement![0] as any).offsetLeft;
    this.mouseMove(index);
  }

  mouseMove(index: number) {
    this.resizableMousemove = this.renderer.listen('document', 'mousemove', (event: MouseEvent) => {
      if (!this.viewport) {
        return;
      }
      if (this.pressed && event.buttons) {
        const currentPositionWithScroll =  event.clientX - this.viewport.elementRef.nativeElement.getBoundingClientRect().left + this.viewport.elementRef.nativeElement.scrollLeft;
        if (currentPositionWithScroll - this.resizedColumnInitialOffsetLeft > this.columnMinWidth) {
          this.resizePosition = currentPositionWithScroll;
          this.ref.detectChanges();
        }
        else {
          this.resizePosition = this.resizedColumnInitialOffsetLeft + this.columnMinWidth;
          this.ref.detectChanges();
        }
      }
    });
    this.resizableMouseup = this.renderer.listen('document', 'mouseup', (event) => {
      if (this.pressed) {
        this.pressed = false;
        this.currentResizeIndex = -1;
        const displacementX = event.pageX - this.startX!;
        const width = this.startWidth! + displacementX;
        this.setColumnWidthChanges(index, width);
        let repoData: RepositoryBrowserData | undefined = this.getLocalStorageData();
        const key = this.allColumnDefs[index].id;
        if (repoData) {
          repoData.columns[key] = (width < this.columnMinWidth ? this.columnMinWidth : width).toString() + 'px';
        } else {
          repoData = {
            columns: {},
          };
          repoData.columns[key] = (width < this.columnMinWidth ? this.columnMinWidth : width).toString() + 'px';
        }
        localStorage.setItem(this._localStorageKey, JSON.stringify(repoData));
        if (this.resizableMousemove) this.resizableMousemove();
        if (this.resizableMouseup) this.resizableMouseup();
      }
    });
  }

  setColumnWidthChanges(index: number, width: number) {
    const origWidth = this.previousWidth;
    const dx = width - origWidth;
    if (dx !== 0) {
      const trs = (this.matTable!.nativeElement as HTMLElement).querySelectorAll('tr');
      const widths = this.columnsWidth ?? '';
      const widthsA = widths.split(' ');
      if (width < this.columnMinWidth) {
        width = this.columnMinWidth;
      }
      this.previousWidth = width;
      // this.allColumnDefs[index].width = width;
      widthsA[index] = width + 'px';
      const stringWidths = widthsA.join(' ');
      // trs.forEach((el) => (el.style.gridTemplateColumns = stringWidths));
      this.columnsWidth = stringWidths;
      this.ref.detectChanges();
    }
  }

  // setColumnWidth(column: ColumnDef, width: number) {
  //   if (this.viewport == null) {
  //     return;
  //   }
  //   const columnEls = Array.from(
  //     this.viewport.elementRef.nativeElement.getElementsByClassName('mat-column-' + column.id)
  //   );
  // }
}
