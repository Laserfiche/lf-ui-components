import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

const COLUMN_MIN_WIDTH: number = 100;

@Directive({
  selector: '[resizeColumn]',
})
export class ResizeColumnDirective {
  @Input('resizeColumn') resizable: boolean = false;
  @Output() widthChanged: EventEmitter<number> = new EventEmitter<number>();

  private column: HTMLElement;

  private pressed: boolean = false;
  resizePosition: number = 0;
  resizedColumnInitialOffsetLeft: number = 0;
  viewport?: HTMLElement;
  startWidth?: number;
  startX?: number;
  th?: HTMLElement;
  divresizer?: HTMLElement;

  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.column = this.el.nativeElement;
  }

  ngOnInit() {
    if (this.resizable) {
      this.th = this.renderer.parentNode(this.column);
      const row = this.renderer.parentNode(this.th);
      const thead = this.renderer.parentNode(row);
      const table = this.renderer.parentNode(thead);
      this.viewport = this.renderer.parentNode(table);
      this.divresizer = this.renderer.createElement('div');
      this.divresizer!.classList.add('repository-browser-resize-overlay');

      const resizer: HTMLElement = this.renderer.createElement('span');
      resizer.classList.add('resize-handle');
      this.renderer.appendChild(this.column, resizer);

      // TODO unlisten ti these
      this.renderer.listen(resizer, 'mousedown', this.onMouseDown.bind(this));
      this.renderer.listen('document', 'mousemove', this.resizableMousemove.bind(this));
      this.renderer.listen('document', 'mouseup', this.resizableMouseup.bind(this));
    }
  }

  onMouseDown = (ev: MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.pressed = true;
    this.startX = ev.pageX;
    this.resizePosition =
      ev.clientX - (this.viewport?.getBoundingClientRect()?.left ?? 0) + (this.viewport?.scrollLeft ?? 0);
    this.viewport?.appendChild(this.divresizer!);
    this.divresizer!.style.left = this.resizePosition + 'px';
    // this.ref.detectChanges();
    this.startWidth = this.th?.offsetWidth ?? 0;
    this.resizedColumnInitialOffsetLeft = this.th?.offsetLeft ?? 0;
  };

  resizableMousemove = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!this.viewport) {
      return;
    }
    if (this.pressed && event.buttons) {
      const currentPositionWithScroll =
        event.clientX - this.viewport.getBoundingClientRect().left + this.viewport.scrollLeft;
      if (currentPositionWithScroll - this.resizedColumnInitialOffsetLeft > COLUMN_MIN_WIDTH) {
        this.resizePosition = currentPositionWithScroll;
        // this.ref.detectChanges();
      } else {
        this.resizePosition = this.resizedColumnInitialOffsetLeft + COLUMN_MIN_WIDTH;
        // this.ref.detectChanges();
      }
      this.divresizer!.style.left = this.resizePosition + 'px';
    }
  };
  resizableMouseup(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.pressed) {
      this.pressed = false;
      const width = this.resizePosition - this.resizedColumnInitialOffsetLeft;
      this.widthChanged.emit(width);
      this.renderer.removeChild(this.viewport, this.divresizer);
    }
  }
}
