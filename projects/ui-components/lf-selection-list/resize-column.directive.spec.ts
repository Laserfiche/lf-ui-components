import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResizeColumnDirective } from './resize-column.directive';

@Component({
  template: `
  <div style="position: relative">
    <table>
      <tr [style.gridTemplateColumns]="gridTemplateColumns">
        <th>
          <div style="width:100%; height: 100%; position: relative" [lfResizeColumn]="true" (widthChanged)="onWidthChange($event)">
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
  gridTemplateColumns: string = `${this.widthChanged}px 100px 100px`;
  onWidthChange(width: number) {
    console.log('width changed', width);
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


  it('should emit widthChange on mouse up',  () => {
      // Arrange
      localStorage.clear();
      const moveX = 100;

      // click the resize-handle
      const resizeHandleEls = Array.from(
        document.getElementsByClassName('resize-handle')
      );
      const headerEls = Array.from(
        document.getElementsByTagName('th')
      );
      const initialClientRight = headerEls[0].getBoundingClientRect().right;
      const initialClientLeft = headerEls[0].getBoundingClientRect().left;
      console.log('initialClientX', initialClientRight);
      const mouseDownEvent  = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: initialClientRight + moveX,
        movementX: moveX,
        bubbles: true,
        cancelable: true,
        view: window,
        buttons: 2
      });
      const mouseupEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
      });
      resizeHandleEls[0].dispatchEvent(mouseDownEvent);
      resizeHandleEls[0].dispatchEvent(mouseMoveEvent);
      resizeHandleEls[0].dispatchEvent(mouseupEvent);
      fixture.detectChanges();

      // Assert

      expect(fixture.componentInstance.widthChanged).toBe(moveX + initialClientRight - initialClientLeft);
    });

    it('should set repository-browser-resize-overlay left with mousemove',  () => {
      // Arrange
      localStorage.clear();
      const moveX = 100;

      // click the resize-handle
      const resizeHandleEls = Array.from(
        document.getElementsByClassName('resize-handle')
      );
      const headerEls = Array.from(
        document.getElementsByTagName('th')
      );
      const initialClientRight = headerEls[0].getBoundingClientRect().right;
      const initialClientLeft = headerEls[0].getBoundingClientRect().left;
      const mouseDownEvent  = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true
      });
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: initialClientRight + moveX,
        movementX: moveX,
        bubbles: true,
        cancelable: true,
        view: window,
        buttons: 2
      });

      resizeHandleEls[0].dispatchEvent(mouseDownEvent);
      resizeHandleEls[0].dispatchEvent(mouseMoveEvent);

      fixture.detectChanges();

      // Assert
      const resize = Array.from(
        document.getElementsByClassName('repository-browser-resize-overlay')
      );
      expect((resize[0] as HTMLDivElement).style.left).toBe(`${moveX + initialClientRight - initialClientLeft}px`);

      // Move the mouse again
      const mouseMoveEvent2 = new MouseEvent('mousemove', {
        clientX: initialClientRight + 2*moveX,
        movementX: moveX,
        bubbles: true,
        cancelable: true,
        view: window,
        buttons: 2
      });

      resizeHandleEls[0].dispatchEvent(mouseMoveEvent2);
      fixture.detectChanges();
      expect((resize[0] as HTMLDivElement).style.left).toBe(`${2*moveX + initialClientRight - initialClientLeft}px`);


    });
});
