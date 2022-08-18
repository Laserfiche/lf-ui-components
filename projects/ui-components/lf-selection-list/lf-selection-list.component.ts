import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ILfSelectable, ItemWithId, Selectable } from '@laserfiche/lf-ui-components/shared';
import { Observable } from 'rxjs';
import { LfListOptionComponent } from './lf-list-option.component';

export interface SelectedItemEvent {
  selected: ILfSelectable;
  selectedItems: ILfSelectable[] | undefined;
};

@Component({
  selector: 'lf-selection-list-component',
  templateUrl: './lf-selection-list.component.html',
  styleUrls: ['./lf-selection-list.component.css']
})
export class LfSelectionListComponent {
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport | undefined;
  @ViewChildren(LfListOptionComponent) options: QueryList<LfListOptionComponent> | undefined;

  @Input() listItemRef?: TemplateRef<unknown>;
  @Input() listItems: ILfSelectable[] = [];
  @Input() set multiple(value: boolean | string) {
    if (typeof(value) === 'string') {
      if (value.toLowerCase() === 'true') { value = true; }
      else { value = false; }
    }
    this._multipleSelectEnabled = value;
    this.selectable.multiSelectable = value;
  };
  get multiple(): boolean {
    return this._multipleSelectEnabled;
  }

  @Output() scrollChanged = new EventEmitter<undefined>();
  @Output() itemDoubleClicked = new EventEmitter<ItemWithId>();
  @Output() itemSelected = new EventEmitter<SelectedItemEvent>();

  currentFocusIndex: number = 0;
  
  protected selectable: Selectable = new Selectable();

  private _multipleSelectEnabled: boolean = false;

  constructor() { 
    window.onkeydown = function(event): boolean | void { 
      if ((event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') && event.target !== document.body) {
        event.preventDefault();
        return false;
      }
    }; 
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

  async onClickMatListOption(event: MouseEvent, option: ILfSelectable, index: number) {
    let target: HTMLElement | null = (event.target as HTMLElement);
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

    this.itemSelected.emit({selected: option, selectedItems: this.selectable.selectedItems});
  }
  
  onDblClick(value: ItemWithId) {
    this.itemDoubleClicked.emit(value);
  }

  async onItemKeyDown(event: KeyboardEvent, item: ILfSelectable) {
    if (
      event.key === ' ' ||
      event.key === 'Enter' ||
      (event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))
    ) {
      if (event.key === 'Enter') {
        this.onDblClick(item.value);
        this.selectable.onItemClicked(event, item, this.listItems);
        return;
      }
      this.selectable.onItemClicked(event, item, this.listItems, false, event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown'));
      this.itemSelected.emit({selected: item, selectedItems: this.selectable.selectedItems});
    }
  }

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

  onViewportKeyDown(event: KeyboardEvent) {
    if (this.viewport == null) {
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (document.activeElement?.parentNode?.nodeName.toLowerCase() !== 'lf-list-option-component') { return; }
      event.preventDefault();
      event.stopPropagation();
      const moveDirection = event.key === 'ArrowUp' ? -1 : 1;
      this.currentFocusIndex = this.currentFocusIndex + moveDirection;
      // Check if currentFocusIndex is out of bounds
      if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.listItems.length) {
        this.currentFocusIndex = this.currentFocusIndex - moveDirection;
      }
      if (!this._checkRowInView(this.currentFocusIndex)) {
        // this way even if we scroll down we go back to the section we were
        this.viewport.scrollToIndex(this.currentFocusIndex);
      }
    }
  }

  setSelectedValuesAsync(values: ILfSelectable[], checkForMoreDataCallback: () => Promise<ILfSelectable[] | undefined>): Promise<ILfSelectable[]> {
    this.selectable.callback = checkForMoreDataCallback;
    return this.selectable.setSelectedValuesAsync(values, this.listItems).then(() => {
      return this.selectable.selectedItems;
    });
  }

  _computeRowId(index: number) {
    return 'lf-row-' + index;
  }

  _checkFocused(currentFocusIndex: number, rowIndex: number) {
    return currentFocusIndex === rowIndex;
  }

  private _checkRowInView(currentFocusIndex: number) {
    if (this.viewport == null) {
      return;
    }
    const rowEle = document.querySelector('#lf-row-' + currentFocusIndex);
    if (rowEle === null) { return false; }
    const rowEleRect = rowEle.getBoundingClientRect();
    const scrollRect = this.viewport.elementRef.nativeElement.getBoundingClientRect();
    return rowEleRect.top >= scrollRect.top && rowEleRect.bottom <= scrollRect.bottom;
  }

  private _focus(tries: number = 0) {
    if (tries >= 10) { return; }
    if (this.options == null || this.options.length === 0) {
      setTimeout(this._focus.bind(this, tries + 1));
      return;
    }
    this.focusCurrentIndex();
    this.options?.get(this.currentFocusIndex)?.focus();
  }

}
