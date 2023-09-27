import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnDef } from './lf-selection-list-types';
import { COLUMN_MIN_WIDTH, ResizeColumnDirective } from './resize-column.directive';

@Component({
  template: `
  <div style="position: relative">
    <table>
      <tr [style.gridTemplateColumns]="gridTemplateColumns">
        <th>
          <div style="width:100%; height: 100%; position: relative" [lfResizeColumn]="columnResizable" [columnDef]="columnDef" (widthChanged)="onWidthChange($event)">
        Header 1</div>
        </th>
        <th>Header 2</th>
        <th>Header 3</th>
      </tr>
      <tr [style.gridTemplateColumns]="gridTemplateColumns">
        <td>1 1</td>
        <td>1 2</td>
        <td>1 3</td>
      </tr>
      <tr [style.gridTemplateColumns]="gridTemplateColumns">
        <td>2 1</td>
        <td>2 2</td>
        <td>2 3</td>
      </tr>
    </table>
  </div>`,
  styles: [
    `
        table {
          border-spacing: 0;
        }
    
        tr {
          display: grid;
        }
    
        th {
          padding: 0 10px;
        }
    
        .resize-handle {
        display: inline-block;
        position: absolute;
        top: 0;
        height: 100%;
        cursor: col-resize;
        opacity: 0;
        width: 15px;
        right: -17.5px;
      }
    
      .repository-browser-resize-overlay {
        position: absolute;
        top: 0;
        height: 100%;
        width: 1px;
        background-color: #aeaeae;
        user-select: none;
        z-index: 1;
        cursor: col-resize;
      }
      `]
})
class TestComponent {
  widthChanged: number = 100;
  columnResizable: boolean = true;
  gridTemplateColumns: string = `${this.widthChanged}px 100px 100px`;
  columnDef: ColumnDef =  { id: 'mock_column_def', displayName: 'Mock Column Def', defaultWidth: '100px', minWidthPx: 50, resizable: true, sortable: true };
  onWidthChange(width: number) {
    this.widthChanged = width;
    this.gridTemplateColumns = `${this.widthChanged}px 100px 100px`;
  }
}

describe('ResizeColumnDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResizeColumnDirective, TestComponent],
    })
      .compileComponents();

      fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
  });


  function mouseDownResizeHandler(resizeHandleEl: HTMLElement) {
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true
    });

    resizeHandleEl.dispatchEvent(mouseDownEvent);
  }

  function mouseMoveResizeHandler(resizeHandleEl: HTMLElement, moveX: number) {
    const initialClientRight = resizeHandleEl.closest('th')?.getBoundingClientRect().right ?? 0;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: initialClientRight + moveX,
      movementX: moveX,
      bubbles: true,
      cancelable: true,
      view: window,
      buttons: 2
    });
    resizeHandleEl.dispatchEvent(mouseMoveEvent);
  }

  function mouseUpResizeHandler(resizeHandleEl: HTMLElement) {
    const mouseupEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
    });

    resizeHandleEl.dispatchEvent(mouseupEvent);
  }

  it('resized column should not be smaller than min width', () => {
    // Arrange
    const moveX = -75;
    const resizeHandleEl = Array.from(
      document.getElementsByClassName('resize-handle')
    )[0] as HTMLElement;
    const initialWidth = resizeHandleEl.closest('th')?.getBoundingClientRect().width ?? 0;

    // Act
    mouseDownResizeHandler(resizeHandleEl);
    mouseMoveResizeHandler(resizeHandleEl, moveX);
    mouseUpResizeHandler(resizeHandleEl);
    fixture.detectChanges();

    // Assert

    expect(fixture.componentInstance.widthChanged).toBe(fixture.componentInstance.columnDef.minWidthPx ?? 0);
  });

  it('should emit widthChange on mouse up',  () => {
      // Arrange
      const moveX = 100;
      const resizeHandleEl = Array.from(
        document.getElementsByClassName('resize-handle')
      )[0] as HTMLElement;
      const initialWidth = resizeHandleEl.closest('th')?.getBoundingClientRect().width ?? 0;

      // Act
      mouseDownResizeHandler(resizeHandleEl);
      mouseMoveResizeHandler(resizeHandleEl, moveX);
      mouseUpResizeHandler(resizeHandleEl);
      fixture.detectChanges();


      // Assert
      expect(fixture.componentInstance.widthChanged).toBe(initialWidth + moveX);
    });

    it('should set repository-browser-resize-overlay left with mousemove',  () => {
      // Arrange
      const moveX = 100;

      const resizeHandleEl = Array.from(
        document.getElementsByClassName('resize-handle')
      )[0] as HTMLElement;
      const initialWidth = resizeHandleEl.closest('th')?.getBoundingClientRect().width ?? 0;

      // Act
      mouseDownResizeHandler(resizeHandleEl);
      mouseMoveResizeHandler(resizeHandleEl, moveX);
      fixture.detectChanges();

      // Assert
      const resize = Array.from(
        document.getElementsByClassName('repository-browser-resize-overlay')
      );
      expect((resize[0] as HTMLDivElement).style.left).toBe(`${moveX + initialWidth}px`);

      // Move the mouse again
      mouseMoveResizeHandler(resizeHandleEl, 2*moveX);
      fixture.detectChanges();

      // Assert
      expect((resize[0] as HTMLDivElement).style.left).toBe(`${2*moveX + initialWidth}px`);
    });
});
