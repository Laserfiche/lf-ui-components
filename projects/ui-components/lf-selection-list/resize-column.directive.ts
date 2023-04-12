import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { ColumnDef } from './lf-selection-list-types';

export const COLUMN_MIN_WIDTH: number = 100;

@Directive({
  selector: '[lfResizeColumn]',
})
export class ResizeColumnDirective implements OnInit, OnDestroy {
  @Input('lfResizeColumn') resizable: boolean = false;
  @Input() columnDef?: ColumnDef;
  @Output() widthChanged: EventEmitter<number> = new EventEmitter<number>();

  private column: HTMLElement;

  private pressed: boolean = false;
  resizePosition: number = 0;
  resizedColumnInitialOffsetLeft: number = 0;
  viewport?: HTMLElement;
  th?: HTMLElement;
  verticalResizeBar?: HTMLElement;
  mouseDownListener?: () => void;
  mouseMoveListener?: () => void;
  mouseUpListener?: () => void;

  constructor(private renderer: Renderer2, private el: ElementRef, private ref: ChangeDetectorRef) {
    this.column = this.el.nativeElement;
  }

  ngOnInit() {
    if (this.resizable) {
      this.th = this.renderer.parentNode(this.column);
      const row = this.renderer.parentNode(this.th);
      const thead = this.renderer.parentNode(row);
      const table = this.renderer.parentNode(thead);
      this.viewport = this.renderer.parentNode(table);
      this.verticalResizeBar = this.renderer.createElement('div');
      this.verticalResizeBar!.classList.add('repository-browser-resize-overlay');

      const resizeHandle: HTMLElement = this.renderer.createElement('span');
      resizeHandle.classList.add('resize-handle');
      this.renderer.appendChild(this.column, resizeHandle);

      this.mouseDownListener = this.renderer.listen(resizeHandle, 'mousedown', this.onMouseDown.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.mouseDownListener) this.mouseDownListener();
    if (this.mouseMoveListener) this.mouseMoveListener();
    if (this.mouseUpListener) this.mouseUpListener();
  }

  onMouseDown = (ev: MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (!this.viewport || !this.verticalResizeBar) {
      console.warn('Unexpected cannot find viewport: resizeColumnDirective mouseDown');
      return;
    }
    this.pressed = true;
    this.resizePosition =
      ev.clientX - (this.viewport.getBoundingClientRect()?.left ?? 0) + (this.viewport.scrollLeft ?? 0);
    this.viewport.appendChild(this.verticalResizeBar);
    this.verticalResizeBar.style.left = this.resizePosition + 'px';
    this.resizedColumnInitialOffsetLeft = this.th?.offsetLeft ?? 0;
    this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.resizableMousemove.bind(this));
    this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.resizableMouseup.bind(this));
  };

  resizableMousemove = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!this.viewport) {
      console.warn('Unexpected cannot find viewport: resizeColumnDirective mouseMove');
      return;
    }
    if (this.pressed && event.buttons) {
      const currentPositionWithScroll =
        event.clientX - this.viewport.getBoundingClientRect().left + this.viewport.scrollLeft;
      const minWidthPx = this.columnDef?.minWidthPx ?? COLUMN_MIN_WIDTH;
      if (currentPositionWithScroll - this.resizedColumnInitialOffsetLeft > minWidthPx) {
        this.resizePosition = currentPositionWithScroll;
      } else {
        this.resizePosition = this.resizedColumnInitialOffsetLeft + minWidthPx;
      }
      this.verticalResizeBar!.style.left = this.resizePosition + 'px';
    }
  };
  resizableMouseup(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.viewport) {
      console.warn('Unexpected cannot find viewport: resizeColumnDirective mouseUp');
      return;
    }
    if (this.pressed) {
      this.pressed = false;
      const width = this.resizePosition - this.resizedColumnInitialOffsetLeft;
      this.widthChanged.emit(width);
      this.renderer.removeChild(this.viewport, this.verticalResizeBar);
      this.ref.detectChanges();
    }
    if (this.mouseMoveListener) this.mouseMoveListener();
    if (this.mouseUpListener) this.mouseUpListener();
  }
}
