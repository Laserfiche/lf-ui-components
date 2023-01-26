import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, FixedSizeVirtualScrollStrategy } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { ILfSelectable, ItemWithId, Selectable } from '@laserfiche/lf-ui-components/shared';
import { map, Observable, of, Subject, combineLatestWith, BehaviorSubject } from 'rxjs';
import { LfListOptionComponent } from './lf-list-option.component';

export interface ColumnOrderBy {
  columnId: string;
  isDesc: boolean;
}

export interface ColumnDef {
  id: string;
  displayName: string;
}
/** @internal */
export interface SelectedItemEvent {
  selected: ILfSelectable;
  selectedItems: ILfSelectable[] | undefined;
}

const PAGESIZE = 20;
const ROW_HEIGHT = 48;

export class GridTableDataSource extends DataSource<any> {
  private _data: any[];

  get allData(): ILfSelectable[] {
    return this._data.slice();
  }

  set allData(data: ILfSelectable[]) {
    this._data = data;
  }

  set firstSetData(data: ILfSelectable[]) {
    this._data = data;
    this.viewport.setTotalContentSize(this.itemSize * data.length);
    this.visibleData.next(this._data.slice(0, PAGESIZE));
  }

  offset = 0;
  offsetChange = new BehaviorSubject(0);
  constructor(initialData: ILfSelectable[], private viewport: CdkVirtualScrollViewport, private itemSize: number) {
    super();
    this._data = initialData;
    this.viewport.setTotalContentSize(this.itemSize * initialData.length);
    this.visibleData.next(this._data.slice(0, PAGESIZE));
    this.viewport.elementScrolled().subscribe((ev: any) => {
      const start = Math.floor(ev.currentTarget.scrollTop / ROW_HEIGHT);
      const prevExtraData = start > 5 ? 5 : 0;
      // const prevExtraData = 0;
      const slicedData = this._data.slice(start - prevExtraData, start + (PAGESIZE - prevExtraData));
      this.offset = ROW_HEIGHT * (start - prevExtraData);
      this.viewport.setRenderedContentOffset(this.offset);
      this.offsetChange.next(this.offset);
      this.visibleData.next(slicedData);
    });
  }

  private readonly visibleData: BehaviorSubject<ILfSelectable[]> = new BehaviorSubject<ILfSelectable[]>([]);

  connect(collectionViewer: CollectionViewer): Observable<any[] | ReadonlyArray<any>> {
    return this.visibleData;
  }

  disconnect(collectionViewer: CollectionViewer): void {}
}

/**
 * Virtual Scroll Strategy
 */
export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(ROW_HEIGHT, 1000, 2000);
  }

  attach(viewport: CdkVirtualScrollViewport): void {
    this.onDataLengthChanged();
  }
}

/** @internal */
@Component({
  selector: 'lf-selection-list-component',
  templateUrl: './lf-selection-list.component.html',
  styleUrls: ['./lf-selection-list.component.css'],
})
export class LfSelectionListComponent implements AfterViewInit, OnDestroy {
  /** @internal */
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport | undefined;
  @Input() itemSize: number = 42;
  private additionalColumnDefs: ColumnDef[] = [];
  allColumnHeaders?: string[] = [];
  /** @internal */
  items: ILfSelectable[] = [];
  columnOrderBy?: ColumnOrderBy;
  @Output() refreshData: EventEmitter<void> = new EventEmitter<void>();
  placeholderHeight: number = 0;

  // need to update data on scroll
  // need to update viewable data on scroll
  // need to update viewable data on adding data? (or removing data) -- need to not start
  // maybe srotre the previous start?? and if we are just adding data, use previous value
  // if setting data, set start to 0
  // how to know if setting vs updating??

  @Input() set listItems(items: ILfSelectable[]) {
    if (!this.items || this.items.length === 0) {
      if (this.dataSource) {
        this.items = items;
        this.dataSource!.firstSetData = this.items;
      }
    } else {
      this.items = items;
      if (this.dataSource) {
        this.dataSource.allData = items;
      }
    }
    // this.viewport?.checkViewportSize();
  }

  placeholderWhen(index: number, _: any) {
    return index == 0;
  }
  // - checkbox in header to select all/remove all -- same thing would need to select all data even data that isn't hthere
  // - formatting
  // - resizing columns
  // - allow passing in ng-template for name "column"

  @Input() set multipleSelection(value: boolean) {
    this._multipleSelectEnabled = value;
    this.selectable.multiSelectable = value;
  }
  get multipleSelection(): boolean {
    return this._multipleSelectEnabled;
  }
  @Input() set columns(cols: ColumnDef[]) {
    const toAdd: string[] = this.multipleSelection ? ['select', 'name'] : ['name'];
    this.allColumnHeaders = toAdd.concat(cols.map((col) => col.id));
    this.additionalColumnDefs = cols;
    this.ref.detectChanges();
  }
  get columns(): ColumnDef[] {
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
    private ref: ChangeDetectorRef
  ) {}

  /** @internal */
  ngAfterViewInit(): void {
    this.dataSource = new GridTableDataSource(this.items, this.viewport!, this.itemSize);
    this.dataSource.offsetChange.subscribe((offset) => {
      this.placeholderHeight = offset;
    });

    // this.dataSource.sort = this.sort;
    // // somehow don't sort until we have all the data

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
  onScroll(event: Observable<number>) {
    if (this.viewport == null) {
      console.error('Viewport was not defined when onScroll was called');
      return;
    }
    // If the viewport is at the end we should try and pull more data
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    if (end === total) {
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
    if (this.viewport == null) {
      return;
    }
    const rowEle = document.querySelector('#lf-row-' + currentFocusIndex);
    if (rowEle === null) {
      return false;
    }
    const rowEleRect = rowEle.getBoundingClientRect();
    const scrollRect = this.viewport.elementRef.nativeElement.getBoundingClientRect();
    return rowEleRect.top >= scrollRect.top && rowEleRect.bottom <= scrollRect.bottom;
  }

  /** @internal */
  private _focus(tries: number = 0) {
    if (tries >= 10) {
      return;
    }
    this.focusCurrentIndex();
  }

  /**
   * @internal
   * @param entry
   * @returns list of strings that represent img src's
   */
  getIcons(entry: any): string[] {
    return typeof entry.icon === 'string' ? [entry.icon] : entry.icon;
  }
}
