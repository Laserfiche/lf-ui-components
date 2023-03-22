import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, Directive, EventEmitter,  Input,  Output,  ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
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
  const create : ColumnDef = { id: propIdCreateDate, displayName: 'Creation Date', defaultWidth: createDateInitialWidth, minWidth: 100, resizable: true, sortable: true };
  const name: ColumnDef = { id: 'name', displayName: 'Name', defaultWidth: '80%', minWidth: 100, resizable: true, sortable: true  };
const itemList: ILfSelectable[] = [
  {isSelectable: true, isSelected: false, value: {id: '1', attributes: new Map<string, PropertyValue>([
    [propIdCreateDate, { value: Date.now(), displayValue: Intl.DateTimeFormat().format(Date.now()) }],
  ]),}},
  {isSelectable: true, isSelected: false, value: {id: '2'}},
  {isSelectable: true, isSelected: false, value: {id: '3'}},
  {isSelectable: true, isSelected: false, value: {id: '4'}},
  {isSelectable: true, isSelected: false, value: {id: '5'}},
  {isSelectable: true, isSelected: false, value: {id: '6'}},
  {isSelectable: true, isSelected: false, value: {id: '7'}},
  {isSelectable: true, isSelected: false, value: {id: '8'}},
  {isSelectable: true, isSelected: false, value: {id: '9'}},
  {isSelectable: true, isSelected: false, value: {id: '10'}},
  {isSelectable: true, isSelected: false, value: {id: '11'}},
  {isSelectable: true, isSelected: false, value: {id: '12'}},
  {isSelectable: true, isSelected: false, value: {id: '13'}},
  {isSelectable: true, isSelected: false, value: {id: '14'}},
  {isSelectable: true, isSelected: false, value: {id: '15'}},
  {isSelectable: true, isSelected: false, value: {id: '16'}},
  {isSelectable: true, isSelected: false, value: {id: '17'}},
  {isSelectable: true, isSelected: false, value: {id: '18'}},
  {isSelectable: true, isSelected: false, value: {id: '19'}},
  {isSelectable: true, isSelected: false, value: {id: '20'}},
  {isSelectable: true, isSelected: false, value: {id: '21'}},
];

@Component({
  selector: 'lf-selection-list-test',
  template: `<div [style.width.px]="containerWidth" [style.height.px]="'250'">
    <lf-selection-list-component id="lf-selection-list"
      style="height: 100%; width: 100%;"
      [listItems]="items" [multipleSelection]="multiple"
      (scrollChanged)="onScroll($event)"
      (itemSelected)="onitemSelected($event)"
      (itemDoubleClicked)="onItemDoubleClicked($event)"
      [columns]="cols"
      [uniqueIdentifier]="uniqueIdentifier"
      ></lf-selection-list-component>
  </div>`,
  styles: []
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
  selector: "[lfResizeColumn]"
})
export class MockResizeDirective {
  @Input('lfResizeColumn') resizable: boolean = false;
  @Input() columnDef?: ColumnDef;
  @Output() widthChanged: EventEmitter<number> = new EventEmitter<number>();
}

describe('LfListComponent single select', () => {
  let component: LfListTestComponent;
  let fixture: ComponentFixture<LfListTestComponent>;

  function setupRepoBrowserWithColumns( columns: ColumnDef[]) {
    // Act
    component.cols = columns;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfListTestComponent, LfSelectionListComponent, MockResizeDirective],
      imports: [
        CommonModule,
        ScrollingModule,
        MatCheckboxModule,
        MatTableModule,
        MatSortModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(LfListTestComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    component.items = itemList;
    fixture.detectChanges();
    flush(); // Need to add this so we can allow the list to render
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the itemSelected event when a selectable list item is clicked', fakeAsync(() => {
    const element = fixture.nativeElement;
    element.querySelector('#lf-row-0').click();
    flush();
    expect(component.selectedEvent?.selected).toEqual(itemList[0]);
    expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
  }));

  it('should emit the itemDoubleClicked event when a selectable list item is clicked', fakeAsync(() => {
    const element = fixture.nativeElement;
    const clickEvent = new MouseEvent('dblclick', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });
    element.querySelector('#lf-row-0').dispatchEvent(clickEvent);
    flush();
    expect(component.doubleClickedItem).toEqual(itemList[0].value);
  }));

  describe('columns support', () => {
    it('should be able to set columns', fakeAsync(() => {
      setupRepoBrowserWithColumns([name, create]);
      flush();

      const trEls = Array.from(
        document.getElementsByClassName('mat-header-row')
      );
      const trEl = trEls[0] as HTMLDivElement;
      const thEls = Array.from(
        trEl.getElementsByClassName('mat-header-cell')
      );
      expect(thEls.length).toBe(2);
    }));

    it('can set column initial width', fakeAsync(async () => {
      // Act
      setupRepoBrowserWithColumns([name, create]);
      flush();

      const trEls = Array.from(
        document.getElementsByClassName('mat-header-row')
      );
      const trEl = trEls[0] as HTMLDivElement;
      const createDateWidth = parseFloat(create.defaultWidth) / 100 * component.containerWidth + 'px';
      const createDateActualWidth = trEl.style.gridTemplateColumns.split(' ')[1];
      expect(createDateWidth).toBe(createDateActualWidth);
    }));

    it('if attempt to resize, write in localstorage the new width in pixel', fakeAsync(async () => {
      // Arrange
      setupRepoBrowserWithColumns([name, create]);
      const newNameWidth = 200;
      component.list!.onColumnWidthChanges(newNameWidth, 0);
      flush();


      const nameColEl = document.getElementsByClassName('mat-column-name')[0] as HTMLDivElement;
      const nameColWidth = nameColEl.offsetWidth;
      expect(nameColWidth).toBe(newNameWidth);
      const storedItem : RepositoryBrowserData = JSON.parse(localStorage.getItem(component.uniqueIdentifier) ?? '{}');
      expect(storedItem.columns['name']).toBe(newNameWidth+'px');
    }));

    it('initialize the columns to have the same size with localstorage data', fakeAsync(async () => {

      // Arrange
      const customNameColumnWidth = '300px';
      const customCreateDateWidth = '400px';
      const initialData : RepositoryBrowserData = {
        columns: {
          'name': customNameColumnWidth,
          'create_date': customCreateDateWidth,
        }
      };
      localStorage.setItem(component.uniqueIdentifier, JSON.stringify(initialData));
      // Act
      setupRepoBrowserWithColumns([name, create]);
      flush();

      // Assert
      const trEls = Array.from(
        document.getElementsByClassName('mat-header-row')
      );
      const trEl = trEls[0] as HTMLDivElement;
      const gridTemplateColumnsWidth = `${customNameColumnWidth} ${customCreateDateWidth}`;
      expect(trEl.style.gridTemplateColumns).toBe(gridTemplateColumnsWidth);
      localStorage.clear();
    }));

    it('sortData sets columnOrderBy and emits refreshData event', fakeAsync(async () => {

      // Arrange
      setupRepoBrowserWithColumns([name, create]);
      flush();

      spyOn(component.list!.refreshData, 'emit');

      fixture.debugElement.query(By.css('.mat-sort-header-arrow')).nativeElement.click();
      fixture.detectChanges();
      // @ts-ignore
      expect(component.list!._columnOrderBy).toEqual({ columnId: 'name', isDesc: false });
      expect(component.list!.refreshData.emit).toHaveBeenCalled();
    }));

    it('if alwaysShowHeader is set to true, header is not hidden', fakeAsync(() => {
      // Arrange
      component.list!.alwaysShowHeader = true; // has to be called first
      setupRepoBrowserWithColumns([create]);
      fixture.detectChanges();
      flush();

      // Assert
      const headerHidden = document.getElementsByClassName('lf-hidden-column-header')[0];
      expect(headerHidden).toBeUndefined();
    }));

    it('if alwaysShowHeader is set to false, header is not hidden even if there are more than one column', fakeAsync(() => {
      // Arrange
      component.list!.alwaysShowHeader = false;
      setupRepoBrowserWithColumns([name, create]);
      fixture.detectChanges();
      flush();

      // Assert
      const headerHidden = document.getElementsByClassName('lf-hidden-column-header')[0];
      expect(headerHidden).toBeUndefined();
    }));


    it('if alwaysShowHeader is set to false, header is hidden if there is only one column', fakeAsync(() => {
      // Arrange
      component.list!.alwaysShowHeader = false;
      setupRepoBrowserWithColumns([create]);
      fixture.detectChanges();
      flush();

      // Assert
      const headerHidden = document.getElementsByClassName('lf-hidden-column-header')[0];
      expect(headerHidden).toBeTruthy();
    }));

  });

  describe('keydown interactions', () => {
    it('should emit itemSelected when space bar is pressed', fakeAsync(() => {
      const element = fixture.nativeElement;
      const keyboardEvent = new KeyboardEvent('keydown', {
        'key': ' ',
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      element.querySelector('#lf-row-0').dispatchEvent(keyboardEvent);
      flush();
      expect(component.selectedEvent?.selected).toEqual(itemList[0]);
      expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
    }));

    it('should emit itemDoubleClicked when enter key is pressed', fakeAsync(() => {
      const element = fixture.nativeElement;
      const keyboardEvent = new KeyboardEvent('keydown', {
        'key': 'Enter',
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      element.querySelector('#lf-row-0').dispatchEvent(keyboardEvent);
      flush();
      expect(component.doubleClickedItem).toEqual(itemList[0].value);
      expect(component.selectedEvent?.selected).toEqual(itemList[0]);
      expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
    }));

    it('should emit itemSelected when ArrowUp is pressed with shift key', fakeAsync(() => {
      const element = fixture.nativeElement;
      const keyboardEvent = new KeyboardEvent('keydown', {
        'key': 'ArrowUp',
        'shiftKey': true,
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      element.querySelector('#lf-row-0').dispatchEvent(keyboardEvent);
      flush();
      expect(component.selectedEvent?.selected).toEqual(itemList[0]);
      expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
    }));

    it('should emit itemSelected when ArrowDown is pressed with shift key', fakeAsync(() => {
      const element = fixture.nativeElement;
      const keyboardEvent = new KeyboardEvent('keydown', {
        'key': 'ArrowDown',
        'shiftKey': true,
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      element.querySelector('#lf-row-0').dispatchEvent(keyboardEvent);
      flush();
      expect(component.selectedEvent?.selected).toEqual(itemList[0]);
      expect(component.selectedEvent?.selectedItems).toEqual([itemList[0]]);
    }));
  });

  // it('should dispatch a scrollChanged when the user scrolls to the end of the viewport', fakeAsync(() => {
  //   const element = fixture.nativeElement;
  //   element.querySelector('#lf-list-viewport').dispatchEvent(new Event('scroll'));
  //   tick();
  //   expect(component.hasScrolled).toBeTrue();
  // }));

  describe('focus', () => {
    it('should focus the first list time when focus is called', fakeAsync(() => {
      // Arrange
      const focusItem = fixture.nativeElement.querySelector('#lf-row-0.item-holder');
      // Act
      component.list?.focus();
      flush();

      // Assert
      expect(document.activeElement).toEqual(focusItem);
    }));

    it('should be able to move the focus with the arrow keys', fakeAsync(() => {
      // Arrange
      const firstFocusItem = fixture.nativeElement.querySelector('#lf-row-1.item-holder');
      const secondFocusItem = fixture.nativeElement.querySelector('#lf-row-0.item-holder');
      const listElement = fixture.nativeElement.querySelector('#lf-list-viewport');
      const downEvent = new KeyboardEvent('keydown', {
        'key': 'ArrowDown',
        'shiftKey': true,
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      const upEvent = new KeyboardEvent('keydown', {
        'key': 'ArrowUp',
        'shiftKey': true,
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      component.list?.focus();
      flush();

      // Act
      listElement.dispatchEvent(downEvent);
      flush();
      expect(document.activeElement).toEqual(firstFocusItem);
      // @ts-ignore
      expect(component.list?.currentFocusIndex).toBe(1);

      // Act again
      listElement.dispatchEvent(upEvent);
      flush();
      expect(document.activeElement).toEqual(secondFocusItem);
      // @ts-ignore
      expect(component.list?.currentFocusIndex).toBe(0);
    }));
  });
});

describe('LfListComponent multi select', () => {
  let component: LfListTestComponent;
  let fixture: ComponentFixture<LfListTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfListTestComponent, LfSelectionListComponent ],
      imports: [
        CommonModule,
        ScrollingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(LfListTestComponent);
    component = fixture.componentInstance;
    component.items = itemList;
    fixture.autoDetectChanges();
    flush(); // Need to add this so we can allow the list to render
  }));
});
