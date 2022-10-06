import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ILfSelectable, ItemWithId } from '../shared/LfSelectable';
import { LfListOptionComponent } from './lf-list-option.component';

import { LfSelectionListComponent, SelectedItemEvent } from './lf-selection-list.component';

const itemList: ILfSelectable[] = [
  {isSelectable: true, isSelected: false, value: {id: '1'}},
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
  template: `<div style="width: 100%; height: 250px;">
    <lf-selection-list-component id="lf-selection-list"
      style="height: 100%;"
      [listItems]="items" [multiple]="multiple"
      (scrollChanged)="onScroll($event)"
      (itemSelected)="onitemSelected($event)"
      (itemDoubleClicked)="onItemDoubleClicked($event)"
      ></lf-selection-list-component>
  </div>`,
  styles: []
})
export class LfListTestComponent {
  @ViewChild(LfSelectionListComponent) list?: LfSelectionListComponent;
  items: ILfSelectable[] = [];
  multiple: boolean = false;

  selectedEvent?: SelectedItemEvent;
  hasScrolled = false;
  doubleClickedItem?: ItemWithId;

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


fdescribe('LfListComponent single select', () => {
  let component: LfListTestComponent;
  let fixture: ComponentFixture<LfListTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfListTestComponent, LfSelectionListComponent, LfListOptionComponent ],
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
      const focusItem = fixture.nativeElement.querySelector('#lf-row-0 #item-holder');
      
      // Act
      component.list?.focus();
      flush();

      // Assert
      expect(document.activeElement).toEqual(focusItem);
    }));

    it('should be able to move the focus with the arrow keys', fakeAsync(async () => {
      // Arrange
      const firstFocusItem = fixture.nativeElement.querySelector('#lf-row-1 #item-holder');
      const secondFocusItem = fixture.nativeElement.querySelector('#lf-row-0 #item-holder');
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
      expect(component.list?.currentFocusIndex).toBe(1);

      // Act again
      listElement.dispatchEvent(upEvent);
      flush();
      expect(document.activeElement).toEqual(secondFocusItem);
      expect(component.list?.currentFocusIndex).toBe(0);
    }));
  });
});

describe('LfListComponent multi select', () => {
  let component: LfListTestComponent;
  let fixture: ComponentFixture<LfListTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfListTestComponent, LfSelectionListComponent, LfListOptionComponent ],
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
