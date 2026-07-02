// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Directive, Input, Renderer2, forwardRef, numberAttribute } from '@angular/core';
import { CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * A no-op `VirtualScrollStrategy` that lets the consumer manage the rendered
 * range and content offset themselves.
 *
 * CDK's built-in `FixedSizeVirtualScrollStrategy` reads `viewport.getDataLength()`
 * inside `_updateRenderedRange` to decide what window to render. When the viewport
 * is driven by a custom `DataSource` (as opposed to `CdkVirtualForOf`), data length
 * stays at 0 and the strategy clamps the rendered range and content offset back to
 * `{0, 0}` / `0` on every scroll tick, which fights any manual layout the consumer
 * applies. This strategy reports scroll index changes but never touches the rendered
 * range or offset, leaving the consumer in full control.
 *
 * @internal
 */
export class LfManagedVirtualScrollStrategy implements VirtualScrollStrategy {
  private readonly _scrolledIndexChange = new Subject<number>();
  readonly scrolledIndexChange: Observable<number> = this._scrolledIndexChange.pipe(distinctUntilChanged());

  private _viewport: CdkVirtualScrollViewport | null = null;
  private _contentWrapper: HTMLElement | null = null;

  constructor(
    private readonly getItemSize: () => number,
    private readonly renderer: Renderer2,
  ) {}

  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
    this._contentWrapper = viewport.elementRef.nativeElement.querySelector(
      '.cdk-virtual-scroll-content-wrapper'
    ) as HTMLElement | null;
  }

  detach(): void {
    this._scrolledIndexChange.complete();
    this._viewport = null;
    this._contentWrapper = null;
  }

  /**
   * Writes `style.transform` on the CDK content wrapper synchronously via `Renderer2`.
   *
   * CDK 21 regression: `_markChangeDetectionNeeded` skips re-scheduling when
   * `_changeDetectionNeeded` is already `true`, so rapid `offsetChange` emissions
   * can miss the async DOM update. Call this after `setRenderedContentOffset` to
   * guarantee the transform is applied regardless of CDK's internal signal state.
   * TODO: remove once https://github.com/angular/components/issues/33484 is resolved.
   *
   * Note: RTL negation for horizontal viewports is not replicated here — this
   * component always uses the default vertical orientation.
   */
  applyRenderedOffset(offset: number): void {
    if (!this._contentWrapper || !this._viewport) {
      return;
    }
    const axis = this._viewport.orientation === 'horizontal' ? 'X' : 'Y';
    this.renderer.setStyle(this._contentWrapper, 'transform', `translate${axis}(${offset}px)`);
  }

  onContentScrolled(): void {
    const viewport = this._viewport;
    if (!viewport) {
      return;
    }
    const itemSize = this.getItemSize();
    if (!itemSize || itemSize <= 0) {
      return;
    }
    const scrollOffset = viewport.measureScrollOffset();
    this._scrolledIndexChange.next(Math.floor(scrollOffset / itemSize));
  }

  onDataLengthChanged(): void {
    // The consumer manages the total content size via `setTotalContentSize`.
  }

  onContentRendered(): void {
    // No-op: the consumer is responsible for rendering.
  }

  onRenderedOffsetChanged(): void {
    // No-op: avoid re-entering `_updateRenderedRange`, which would fight the
    // consumer-managed rendered range / offset.
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    const viewport = this._viewport;
    if (!viewport) {
      return;
    }
    const itemSize = this.getItemSize();
    if (!itemSize || itemSize <= 0) {
      return;
    }
    viewport.scrollToOffset(index * itemSize, behavior);
  }
}

/**
 * Attaches a no-op `VirtualScrollStrategy` to a `cdk-virtual-scroll-viewport`,
 * replacing CDK's default `FixedSizeVirtualScrollStrategy`. Use this when the
 * rendered slice and content offset are managed manually (for example, by
 * `GridSelectionListDataSource`).
 *
 * @internal
 */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[lfManagedItemSize]',
  standalone: true,
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (directive: LfManagedVirtualScrollDirective) => directive.scrollStrategy,
      deps: [forwardRef(() => LfManagedVirtualScrollDirective)],
    },
  ],
})
export class LfManagedVirtualScrollDirective {
  @Input({ alias: 'lfManagedItemSize', transform: numberAttribute }) itemSize = 42;

  readonly scrollStrategy: LfManagedVirtualScrollStrategy;

  constructor(renderer: Renderer2) {
    this.scrollStrategy = new LfManagedVirtualScrollStrategy(() => this.itemSize, renderer);
  }
}
