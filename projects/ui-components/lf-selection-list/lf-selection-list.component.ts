import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
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
import { MatTable } from '@angular/material/table';
import { ILfSelectable, ItemWithId, Selectable } from '@laserfiche/lf-ui-components/shared';
import { combineLatest, map, Observable, of, Subject, combineLatestWith, startWith } from 'rxjs';
import { LfListOptionComponent } from './lf-list-option.component';

/** @internal */
export interface ColumnDef {
  id: string;
  displayName: string;
}
/** @internal */
export interface SelectedItemEvent {
  selected: ILfSelectable;
  selectedItems: ILfSelectable[] | undefined;
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
  /** @internal */
  @ViewChildren(LfListOptionComponent) options: QueryList<LfListOptionComponent> | undefined;
  @Input() itemSize: number = 42;
  /** @internal */
  @Input() listItemRef?: TemplateRef<unknown>; // TODO: figure out how to define TemplateRef for non Angular project
  items: ILfSelectable[] = [];
  @Input() set listItems(items: ILfSelectable[]) {
    this.items = items;
    this.allData.next(items);
    this.viewport?.checkViewportSize();
  }
  // - sorting messes with selected indices
  // - sorting when not all the data is there
  // - checkbox in header to select all/remove all
  // - formatting
  // - resizing columns
  // - accessibility when two repository browsers are on page
  // - update columns -- btton in documentation
  private additionalColumnDefs: ColumnDef[] = [];
  allColumnHeaders?: string[] = [];
  allData: Subject<ILfSelectable[]> = new Subject<ILfSelectable[]>();


  @Input() set multipleSelection(value: boolean) {
    this._multipleSelectEnabled = value;
    this.selectable.multiSelectable = value;
  }
  get multipleSelection(): boolean {
    return this._multipleSelectEnabled;
  }
  @Input() set columns(cols: ColumnDef[]) {
    let toAdd: string[] = this.multipleSelection ? ['select', 'name'] : ['name'];
    this.allColumnHeaders = toAdd.concat(cols.map((col) => col.id));
    this.additionalColumnDefs = cols;
    this.ref.detectChanges();
  }
  get columns(): ColumnDef[] {
    return this.additionalColumnDefs;
  }

  dataSource: Observable<Array<ILfSelectable>> = of([]);
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

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  /** @internal */
  ngAfterViewInit(): void {
    this.dataSource = this.allData.pipe(
      combineLatestWith(this.viewport!.renderedRangeStream),
      map((value: any) => {
        console.log(value[1]);
        // Update the datasource for the rendered range of data
        return value[0].slice(value[1].start, value[1].end);
      })
    );

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
    const data = this.items;
    if (!sort.active || sort.direction === '') {
      return;
    }

    const sortedData = data?.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      if (sort.active === 'name') {
        return this.compare((a?.value as any)['name'].toLowerCase(), (b?.value as any)['name'].toLowerCase(), isAsc);
      } else if (sort.active !== undefined) {
        const aVal = (a.value as any)?.properties?.get(sort.active).value;
        const bVal = (b.value as any)?.properties?.get(sort.active).value;
        // hp tp sort if undefined..
        if (Object.prototype.toString.call(aVal) === '[object Date]') {
          return this.compare((aVal as Date).getTime(), (bVal as Date)?.getTime(), isAsc);
        } else if (typeof aVal === 'number') {
          return this.compare(aVal, bVal as number, isAsc);
        } else if (typeof aVal === 'string') {
          return this.compare(aVal.toLowerCase(), bVal.toLowerCase(), isAsc);
        } else {
          // err -- not valid?
          // or just do straight comparison?
        }
        // sort based on a.value.properties[{{sort.active}}].value
        // if Date sort by date, if number sort by number etc.
        return 0;
      } else {
        return 0;
      }
    });
    this.allData.next(sortedData);
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
    this.itemFocused.emit(this.items[index].value);
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
        const ele = document.querySelector('#lf-row-' + this.currentFocusIndex) as HTMLElement;
        (ele?.childNodes[0] as HTMLElement).focus();
      } else {
        const moveDirection = event.key === 'ArrowUp' ? -1 : 1;
        this.currentFocusIndex = this.currentFocusIndex + moveDirection;
        // Check if currentFocusIndex is out of bounds
        if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.items.length) {
          this.currentFocusIndex = this.currentFocusIndex - moveDirection;
        }
        // TODO this dorsn't work  whrn multiple components on page
        const ele = document.querySelector('#lf-row-' + this.currentFocusIndex) as HTMLElement;
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
    if (this.options == null || this.options.length === 0) {
      setTimeout(this._focus.bind(this, tries + 1));
      return;
    }
    this.focusCurrentIndex();
    this.options?.get(this.currentFocusIndex)?.focus();
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
