// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, Directive, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ILfSelectable, ItemWithId, PropertyValue } from '@laserfiche/lf-ui-components/shared';
import { ColumnDef, SelectedItemEvent } from './lf-selection-list-types';
import { LfSelectionListComponent, RepositoryBrowserData } from './lf-selection-list.component';

const propIdCreateDate: string = 'create_date';
const createDateInitialWidth = '35%';
const create: ColumnDef = {
  id: propIdCreateDate,
  displayName: 'Creation Date',
  defaultWidth: createDateInitialWidth,
  minWidthPx: 100,
  resizable: true,
  sortable: true,
};
const name: ColumnDef = {
  id: 'name',
  displayName: 'Name',
  defaultWidth: '80%',
  minWidthPx: 100,
  resizable: true,
  sortable: true,
};
const itemList: ILfSelectable[] = [
  {
    isSelectable: true,
    isSelected: false,
    value: {
      id: '1',
      attributes: new Map<string, PropertyValue>([
        [propIdCreateDate, { value: Date.now(), displayValue: Intl.DateTimeFormat().format(Date.now()) }],
      ]),
    },
  },
  { isSelectable: true, isSelected: false, value: { id: '2' } },
  { isSelectable: true, isSelected: false, value: { id: '3' } },
  { isSelectable: true, isSelected: false, value: { id: '4' } },
  { isSelectable: true, isSelected: false, value: { id: '5' } },
  { isSelectable: true, isSelected: false, value: { id: '6' } },
  { isSelectable: true, isSelected: false, value: { id: '7' } },
  { isSelectable: true, isSelected: false, value: { id: '8' } },
  { isSelectable: true, isSelected: false, value: { id: '9' } },
  { isSelectable: true, isSelected: false, value: { id: '10' } },
  { isSelectable: true, isSelected: false, value: { id: '11' } },
  { isSelectable: true, isSelected: false, value: { id: '12' } },
  { isSelectable: true, isSelected: false, value: { id: '13' } },
  { isSelectable: true, isSelected: false, value: { id: '14' } },
  { isSelectable: true, isSelected: false, value: { id: '15' } },
  { isSelectable: true, isSelected: false, value: { id: '16' } },
  { isSelectable: true, isSelected: false, value: { id: '17' } },
  { isSelectable: true, isSelected: false, value: { id: '18' } },
  { isSelectable: true, isSelected: false, value: { id: '19' } },
  { isSelectable: true, isSelected: false, value: { id: '20' } },
  { isSelectable: true, isSelected: false, value: { id: '21' } },
];

function createSelectableItems(count: number): ILfSelectable[] {
  return Array.from({ length: count }, (_, index) => ({
    isSelectable: true,
    isSelected: false,
    value: { id: `${index}` },
  }));
}

@Component({
  selector: 'lf-selection-list-test',
  template: `<div [style.width.px]="containerWidth" [style.height.px]="'250'">
    <lf-selection-list-component
      id="lf-selection-list"
      style="height: 100%; width: 100%;"
      [listItems]="items"
      [multipleSelection]="multiple"
      (scrollChanged)="onScroll($event)"
      (itemSelected)="onitemSelected($event)"
      (itemDoubleClicked)="onItemDoubleClicked($event)"
      [columns]="cols"
      [alwaysShowHeader]="alwaysShowHeader"
      [uniqueIdentifier]="uniqueIdentifier"
    ></lf-selection-list-component>
  </div>`,
  styles: [],
  standalone: true,
  imports: [LfSelectionListComponent],
})
export class LfListTestComponent {
  @ViewChild(LfSelectionListComponent) list?: LfSelectionListComponent;
  items: ILfSelectable[] = [];
  multiple: boolean = false;
  containerWidth: number = 500;
  selectedEvent?: SelectedItemEvent;
  hasScrolled = false;
  doubleClickedItem?: ItemWithId;
  uniqueIdentifier: string = 'test-browser';
  cols: ColumnDef[] = [name];
  alwaysShowHeader?: boolean;

  onScroll(event: any) {
    this.hasScrolled = true;
  }
  onitemSelected(event: SelectedItemEvent) {
    this.selectedEvent = event;
  }
  onItemDoubleClicked(event: ItemWithId) {
    this.doubleClickedItem = event;
  }
}

@Directive({
  selector: '[lfResizeColumn]',
  standalone: true,
})
export class MockResizeDirective {
  @Input('lfResizeColumn') resizable: boolean = false;
  @Input() columnDef?: ColumnDef;
  @Output() widthChanged: EventEmitter<number> = new EventEmitter<number>();
}

describe('LfListComponent single select', () => {
  let component: LfListTestComponent;
  let fixture: ComponentFixture<LfListTestComponent>;

  async function waitForRender() {
    fixture.autoDetectChanges();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await fixture.whenStable();
  }

  async function setupRepoBrowserWithColumns(columns: ColumnDef[]) {
    component.cols = columns;
    await waitForRender();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ScrollingModule,
        MatCheckboxModule,
        MatTableModule,
        MatSortModule,
        BrowserAnimationsModule,
        LfListTestComponent,
        MockResizeDirective,
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(LfListTestComponent);
    component = fixture.componentInstance;
    component.items = itemList;
  });

  it('should create', async () => {
    await waitForRender();
    expect(component).toBeTruthy();
  });

  it('renders rows when items are populated after the component initializes empty', async () => {
    const localFixture = TestBed.createComponent(LfSelectionListComponent);
    localFixture.componentRef.setInput('columns', [name]);
    localFixture.componentRef.setInput('uniqueIdentifier', 'async-population-test');
    localFixture.componentRef.setInput('listItems', []);
    localFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await localFixture.whenStable();

    localFixture.componentRef.setInput('listItems', createSelectableItems(5));
    localFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await localFixture.whenStable();

    const rows = localFixture.nativeElement.querySelectorAll('tr.item-holder');

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].id).toBe('lf-row-0');

    localFixture.destroy();
  });

  it('should emit the itemSelected event when a selectable list item is clicked', async () => {
    await waitForRender();
    const element = fixture.nativeElement;
    element.querySelector('#lf-row-0').click();
    await fixture.whenStable();
    expect(component.selectedEvent?.selected).toEqual(itemList[0]);
    expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
  });

  it('should emit the itemDoubleClicked event when a selectable list item is clicked', async () => {
    await waitForRender();
    const element = fixture.nativeElement;
    const clickEvent = new MouseEvent('dblclick', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    element.querySelector('#lf-row-0').dispatchEvent(clickEvent);
    await fixture.whenStable();
    expect(component.doubleClickedItem).toEqual(itemList[0].value);
  });

  describe('columns support', () => {
    it('should be able to set columns', async () => {
      await setupRepoBrowserWithColumns([name, create]);

      const trEls = Array.from(document.getElementsByClassName('mat-mdc-header-row'));
      const trEl = trEls[0] as HTMLDivElement;
      const thEls = Array.from(trEl.getElementsByClassName('mat-mdc-header-cell'));
      expect(thEls.length).toBe(2);
    });

    it('can set column initial width', async () => {
      // Act
      await setupRepoBrowserWithColumns([name, create]);

      const trEls = Array.from(document.getElementsByClassName('mat-mdc-header-row'));
      const trEl = trEls[0] as HTMLDivElement;
      const createDateWidth = (parseFloat(create.defaultWidth) / 100) * component.containerWidth + 'px';
      const createDateActualWidth = trEl.style.gridTemplateColumns.split(' ')[1];
      expect(createDateWidth).toBe(createDateActualWidth);
    });

    it('if attempt to resize, write in localstorage the new width in pixel', async () => {
      // Arrange
      await setupRepoBrowserWithColumns([name, create]);
      const newNameWidth = 200;
      component.list!.onColumnWidthChanges(newNameWidth, 0);
      await fixture.whenStable();

      const nameColEl = document.getElementsByClassName('mat-column-name')[0] as HTMLDivElement;
      const nameColWidth = nameColEl.offsetWidth;
      expect(nameColWidth).toBe(newNameWidth);
      const storedItem: RepositoryBrowserData = JSON.parse(localStorage.getItem(component.uniqueIdentifier) ?? '{}');
      expect(storedItem.columns['name']).toBe(newNameWidth + 'px');
    });

    it('initialize the columns to have the same size with localstorage data', async () => {
      // Arrange
      const customNameColumnWidth = '300px';
      const customCreateDateWidth = '400px';
      const initialData: RepositoryBrowserData = {
        columns: {
          name: customNameColumnWidth,
          create_date: customCreateDateWidth,
        },
      };
      localStorage.setItem(component.uniqueIdentifier, JSON.stringify(initialData));
      // Act
      await setupRepoBrowserWithColumns([name, create]);

      // Assert
      const trEls = Array.from(document.getElementsByClassName('mat-mdc-header-row'));
      const trEl = trEls[0] as HTMLDivElement;
      const gridTemplateColumnsWidth = `${customNameColumnWidth} ${customCreateDateWidth}`;
      expect(trEl.style.gridTemplateColumns).toBe(gridTemplateColumnsWidth);
      localStorage.clear();
    });

    it('sortData sets columnOrderBy and emits refreshData event', async () => {
      // Arrange
      await setupRepoBrowserWithColumns([name, create]);

      vi.spyOn(component.list!.refreshData, 'emit');

      fixture.debugElement.query(By.css('.mat-sort-header-arrow')).nativeElement.click();
      await waitForRender();
      // @ts-ignore
      expect(component.list!._columnOrderBy).toEqual({ columnId: 'name', isDesc: false });
      expect(component.list!.refreshData.emit).toHaveBeenCalled();
    });

    it('if alwaysShowHeader is set to true, header is not hidden', async () => {
      // Arrange
      component.alwaysShowHeader = true;
      await setupRepoBrowserWithColumns([create]);

      // Assert
      const headerHidden = document.getElementsByClassName('lf-hidden-column-header')[0];
      expect(headerHidden).toBeUndefined();
    });

    it('if alwaysShowHeader is set to false, header is not hidden even if there are more than one column', async () => {
      // Arrange
      component.alwaysShowHeader = false;
      await setupRepoBrowserWithColumns([name, create]);

      // Assert
      const headerHidden = document.getElementsByClassName('lf-hidden-column-header')[0];
      expect(headerHidden).toBeUndefined();
    });

    it('if alwaysShowHeader is set to false, header is hidden if there is only one column', async () => {
      // Arrange
      component.alwaysShowHeader = false;
      await setupRepoBrowserWithColumns([create]);

      // Assert
      const headerHidden = document.getElementsByClassName('lf-hidden-column-header')[0];
      expect(headerHidden).toBeUndefined();
    });

    it('keeps the rendered row height equal to itemSize when row dividers are shown', async () => {
      await waitForRender();

      const firstRow = fixture.nativeElement.querySelector('#lf-row-0.item-holder') as HTMLElement;
      expect(firstRow.getBoundingClientRect().height).toBe(component.list?.itemSize);
    });

    it('keeps the first rendered row height equal to itemSize when the header is hidden', async () => {
      component.alwaysShowHeader = false;
      await setupRepoBrowserWithColumns([create]);

      const firstRow = fixture.nativeElement.querySelector('#lf-row-0.item-holder') as HTMLElement;
      expect(firstRow.getBoundingClientRect().height).toBe(component.list?.itemSize);
    });
  });

  describe('keydown interactions', () => {
    it('should emit itemSelected when space bar is pressed', async () => {
      await waitForRender();
      const element = fixture.nativeElement;
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: ' ',
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.querySelector('#lf-row-0').dispatchEvent(keyboardEvent);
      await fixture.whenStable();
      expect(component.selectedEvent?.selected).toEqual(itemList[0]);
      expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
    });

    it('should emit itemDoubleClicked when enter key is pressed', async () => {
      await waitForRender();
      const element = fixture.nativeElement;
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.querySelector('#lf-row-0').dispatchEvent(keyboardEvent);
      await fixture.whenStable();
      expect(component.doubleClickedItem).toEqual(itemList[0].value);
      expect(component.selectedEvent?.selected).toEqual(itemList[0]);
      expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
    });

    it('should emit itemSelected when ArrowUp is pressed with shift key', async () => {
      await waitForRender();
      const element = fixture.nativeElement;
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        shiftKey: true,
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.querySelector('#lf-row-0').dispatchEvent(keyboardEvent);
      await fixture.whenStable();
      expect(component.selectedEvent?.selected).toEqual(itemList[0]);
      expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
    });

    it('should emit itemSelected when ArrowDown is pressed with shift key', async () => {
      await waitForRender();
      const element = fixture.nativeElement;
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        shiftKey: true,
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.querySelector('#lf-row-0').dispatchEvent(keyboardEvent);
      await fixture.whenStable();
      expect(component.selectedEvent?.selected).toEqual(itemList[0]);
      expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
    });
  });

  // it('should dispatch a scrollChanged when the user scrolls to the end of the viewport', async () => {
  //   const element = fixture.nativeElement;
  //   element.querySelector('#lf-list-viewport').dispatchEvent(new Event('scroll'));
  //   tick();
  //   expect(component.hasScrolled).toBe(true);
  // });

  describe('focus', () => {
    it('should focus the first list time when focus is called', async () => {
      await waitForRender();
      // Arrange
      const focusItem = fixture.nativeElement.querySelector('#lf-row-0.item-holder');
      // Act
      component.list?.focus();
      await fixture.whenStable();

      // Assert
      expect(document.activeElement).toEqual(focusItem);
    });

    it('should be able to move the focus with the arrow keys', async () => {
      await waitForRender();
      // Arrange
      const firstFocusItem = fixture.nativeElement.querySelector('#lf-row-1.item-holder');
      const secondFocusItem = fixture.nativeElement.querySelector('#lf-row-0.item-holder');
      const listElement = fixture.nativeElement.querySelector('#lf-list-viewport');
      const downEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        shiftKey: true,
        view: window,
        bubbles: true,
        cancelable: true,
      });
      const upEvent = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        shiftKey: true,
        view: window,
        bubbles: true,
        cancelable: true,
      });
      component.list?.focus();
      await fixture.whenStable();

      // Act
      listElement.dispatchEvent(downEvent);
      await fixture.whenStable();
      expect(document.activeElement).toEqual(firstFocusItem);
      // @ts-ignore
      expect(component.list?.currentFocusIndex).toBe(1);

      // Act again
      listElement.dispatchEvent(upEvent);
      await fixture.whenStable();
      expect(document.activeElement).toEqual(secondFocusItem);
      // @ts-ignore
      expect(component.list?.currentFocusIndex).toBe(0);
    });

    it('does not hijack PageDown so the viewport can handle native paging', async () => {
      component.items = createSelectableItems(500);
      await waitForRender();

      const pageDownEvent = new KeyboardEvent('keydown', {
        key: 'PageDown',
        view: window,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(pageDownEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(pageDownEvent, 'stopPropagation');
      const scrollToIndexSpy = vi.spyOn(component.list!.viewport!, 'scrollToIndex');

      component.list?.focus();
      await fixture.whenStable();

      component.list?.onViewportKeyDown(pageDownEvent);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(stopPropagationSpy).not.toHaveBeenCalled();
      expect(scrollToIndexSpy).not.toHaveBeenCalled();
      expect(component.list?.currentFocusIndex).toBe(0);
    });

    it('scrolls a deep focused row into the rendered slice before retrying focus', async () => {
      component.items = createSelectableItems(10000);
      await waitForRender();

      const scrollToIndexSpy = vi.spyOn(component.list!.viewport!, 'scrollToIndex');

      component.list!.currentFocusIndex = 1065;
      component.list?.focus();
      await waitForRender();

      expect(scrollToIndexSpy).toHaveBeenCalledWith(1065);
    });
  });

  describe('virtual scroll offset', () => {
    it('applies the rendered content offset after scrolling past the initial slice', async () => {
      component.items = createSelectableItems(500);
      await waitForRender();

      component.list?.viewport?.scrollTo({ top: 14000 });
      await waitForRender();

      const firstRenderedRow = fixture.nativeElement.querySelector('tr.item-holder') as HTMLElement;

      expect(firstRenderedRow.id).not.toBe('lf-row-0');
    });

    it('keeps the header pinned to the top of the viewport after the rendered slice shifts', async () => {
      component.items = createSelectableItems(500);
      component.cols = [name, create];
      await waitForRender();

      component.list?.viewport?.scrollTo({ top: 14000 });
      await waitForRender();

      const shell = fixture.nativeElement.querySelector('.lf-selection-list-scroll-shell') as HTMLElement;
      const viewport = fixture.nativeElement.querySelector('#lf-list-viewport') as HTMLElement;
      const header = fixture.nativeElement.querySelector('tr.mat-mdc-header-row') as HTMLElement;

      const firstRenderedRow = fixture.nativeElement.querySelector('tr.item-holder') as HTMLElement;

      expect(firstRenderedRow.id).not.toBe('lf-row-0');
      expect(Math.abs(header.getBoundingClientRect().top - shell.getBoundingClientRect().top)).toBeLessThanOrEqual(1);
      expect(
        Math.abs(header.getBoundingClientRect().bottom - viewport.getBoundingClientRect().top)
      ).toBeLessThanOrEqual(1);
    });

    it('keeps rows rendered after deep scrolling into a large list', async () => {
      component.items = createSelectableItems(500);
      await waitForRender();

      component.list?.viewport?.scrollTo({ top: 14000 });
      await waitForRender();

      const rows = fixture.nativeElement.querySelectorAll('tr.item-holder');

      expect(rows.length).toBeGreaterThan(0);
      expect((rows[0] as HTMLElement).id).not.toBe('lf-row-0');
    });

    it('keeps the rendered slice at the tail when scrolling to the bottom of a large list', async () => {
      component.items = createSelectableItems(10000);
      await waitForRender();

      component.list?.viewport?.scrollTo({ top: 999999 });
      await waitForRender();

      const rows = fixture.nativeElement.querySelectorAll('tr.item-holder');

      expect(rows.length).toBeGreaterThan(0);
      expect((rows[0] as HTMLElement).id).not.toBe('lf-row-0');
    });

    it('anchors the tail-aligned rendered slice from the end of the viewport', async () => {
      component.items = createSelectableItems(500);
      await waitForRender();

      const setRenderedContentOffsetSpy = vi.spyOn(component.list!.viewport!, 'setRenderedContentOffset');

      component.list?.viewport?.scrollTo({ top: 999999 });
      await waitForRender();

      expect(setRenderedContentOffsetSpy.mock.calls).toContainEqual([0, 'to-end']);
    });
  });
});
