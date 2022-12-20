import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
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
import { Observable } from 'rxjs';
import { ILfSelectable, ItemWithId, Selectable } from '../shared/lf-shared-public-api';
import { LfListOptionComponent } from './lf-list-option.component';

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
  @Input() listItems: ILfSelectable[] = [];
  @Input() set multiple(value: boolean | string) {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        value = true;
      } else {
        value = false;
      }
    }
    this._multipleSelectEnabled = value;
    this.selectable.multiSelectable = value;
  }
  get multiple(): boolean {
    return this._multipleSelectEnabled;
  }

  @Output() scrollChanged = new EventEmitter<undefined>();
  @Output() itemDoubleClicked = new EventEmitter<ItemWithId>();
  @Output() itemSelected = new EventEmitter<SelectedItemEvent>();
  @Output() itemFocused = new EventEmitter<ItemWithId>();

  /** @internal */
  private currentFocusIndex: number = 0;

  /** @internal */
  protected selectable: Selectable = new Selectable();
  /** @internal */
  private _multipleSelectEnabled: boolean = false;

  /** @internal */
  constructor(
    /** @internal */
    private focusMonitor: FocusMonitor
  ) {}

  /** @internal */
  ngAfterViewInit(): void {
    // this is to keep track of when the viewport is unfocused
    if (this.viewport?.elementRef.nativeElement) {
      this.focusMonitor.monitor(this.viewport?.elementRef.nativeElement, true).subscribe((origin: FocusOrigin) => {
        if (!origin || document.activeElement?.nodeName.toLowerCase() === 'cdk-virtual-scroll-viewport') {
          this.itemFocused.emit(undefined);
        }
      });
    }
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.viewport!.elementRef.nativeElement);
  }

  clearSelectedValues() {
    this.selectable.clearSelectedValues(this.listItems);
  }

  focus() {
    this._focus();
  }

  // When the table content gets focused we check to see if we need to reset the currentFocusIndex
  // we do this by checking to see if it is larger than the list
  focusCurrentIndex() {
    if (this.currentFocusIndex >= this.listItems.length) {
      this.currentFocusIndex = 0;
    }
    if (!this.listItems[this.currentFocusIndex] || !this.listItems[this.currentFocusIndex]) {
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
      this.selectable.onItemClicked(event, option, this.listItems, true);
    } else {
      this.selectable.onItemClicked(event, option, this.listItems);
    }
    this.currentFocusIndex = index;

    this.itemSelected.emit({ selected: option, selectedItems: this.selectable.selectedItems });
  }

  /** @internal */
  onDblClick(event: MouseEvent | KeyboardEvent, item: ILfSelectable) {
    if (item.isSelectable && !item.isSelected) {
      this.selectable.onItemClicked(event, item, this.listItems, true);
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
        this.selectable.onItemClicked(event, item, this.listItems);
        this.itemSelected.emit({ selected: item, selectedItems: this.selectable.selectedItems });
        this.onDblClick(event, item);
        return;
      }
      this.selectable.onItemClicked(
        event,
        item,
        this.listItems,
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
        this.listItems,
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
    this.itemFocused.emit(this.listItems[index].value);
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
        activeElement?.parentNode?.nodeName.toLowerCase() !== 'lf-list-option-component'
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
        if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.listItems.length) {
          this.currentFocusIndex = this.currentFocusIndex - moveDirection;
        }
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
    await this.selectable.setSelectedNodesAsync(values, this.listItems, maxFetchIterations);
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
}
