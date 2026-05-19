// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subscription, BehaviorSubject, Observable, Subject } from 'rxjs';
import { ILfSelectable } from '@laserfiche/lf-ui-components/shared';

/**
 * @internal
 */
export class GridSelectionListDataSource extends DataSource<any> {
  private _data: ILfSelectable[];
  private readonly visibleData: BehaviorSubject<ILfSelectable[]> = new BehaviorSubject<ILfSelectable[]>([]);
  private requestedDataLength?: number;
  private totalContentSizeSyncQueued = false;
  private suppressScrollEvents = false;

  checkForData: Subject<void> = new Subject<void>();
  indexChangeSub: Subscription;
  currentScrollIndex: number = 0;
  dataStart: number = 0;
  dataEnd: number = 0;

  offset = 0;
  offsetChange = new BehaviorSubject(0);

  extraData!: number;
  bufferToEnd!: number;

  get allData(): ILfSelectable[] {
    return this._data.slice();
  }

  set allData(data: ILfSelectable[]) {
    const existingData = this._data;
    const existingLength = existingData?.length ?? 0;
    this._data = data;
    this.requestedDataLength = undefined;
    this.viewport.setTotalContentSize(this.itemSize * this._data.length);
    if (!existingData || existingLength === 0) {
      this.resetView();
      return;
    }

    this.refreshViewAtCurrentIndex();

    if (this.shouldRequestMoreData()) {
      this.checkForData.next();
    }
  }

  private resetView() {
    this.dataStart = 0;
    this.dataEnd = Math.min(this.pageSize, this._data.length);
    const renderedItems = this._data.slice(this.dataStart, this.dataEnd);
    this.visibleData.next(renderedItems);
    this.viewport.setRenderedRange({ start: 0, end: renderedItems.length });
    this.viewport.scrollTo({ top: 0 });
    this.offsetChange.next(0);
    this.scheduleViewportSync();
  }

  constructor(
    initialData: ILfSelectable[],
    private viewport: CdkVirtualScrollViewport,
    private itemSize: number,
    public pageSize: number
  ) {
    super();
    this.extraData = Math.ceil(this.pageSize / 2);
    this.bufferToEnd = Math.ceil(this.pageSize / 4);
    this._data = initialData;
    this.viewport.setTotalContentSize(this.itemSize * initialData.length);
    this.dataStart = 0;
    this.dataEnd = Math.min(this.pageSize, initialData.length);
    const renderedItems = this._data.slice(this.dataStart, this.dataEnd);
    this.visibleData.next(renderedItems);
    this.viewport.setRenderedRange({ start: 0, end: renderedItems.length });
    this.scheduleViewportSync();

    this.indexChangeSub = this.viewport.scrolledIndexChange.subscribe((currentScrollIndex) => {
      if (this.suppressScrollEvents) {
        return;
      }

      this.currentScrollIndex = currentScrollIndex;
      const numItemsInView = this.getNumItemsInView();
      const scrollPastEndOfData = currentScrollIndex + numItemsInView > this.dataEnd - this.bufferToEnd;
      const startAccountingForBuffer =
        currentScrollIndex > this.bufferToEnd ? currentScrollIndex - this.bufferToEnd : 0;
      const scrollBeforeStartOfData = startAccountingForBuffer < this.dataStart;
      if (scrollPastEndOfData || scrollBeforeStartOfData) {
        this.refreshViewAtIndex(currentScrollIndex, numItemsInView);
      }

      // If the viewport is at the end we should try and pull more data
      const needMore = this.shouldRequestMoreData(numItemsInView);
      if (needMore && this.requestedDataLength !== this._data.length) {
        this.requestedDataLength = this._data.length;
        this.checkForData.next();
      }
    });
  }

  private getNumItemsInView(): number {
    const viewportHeight = this.viewport.elementRef.nativeElement.getBoundingClientRect().height;
    return Math.max(1, Math.ceil(viewportHeight / this.itemSize));
  }

  private refreshViewAtCurrentIndex() {
    this.refreshViewAtIndex(this.getCurrentViewportIndex(), this.getNumItemsInView());
  }

  private getCurrentViewportIndex(): number {
    const viewportElement = this.viewport.elementRef.nativeElement;
    const scrollTop = viewportElement?.scrollTop;

    if (typeof scrollTop === 'number' && Number.isFinite(scrollTop)) {
      return Math.floor(scrollTop / this.itemSize);
    }

    return this.currentScrollIndex;
  }

  private refreshViewAtIndex(currentScrollIndex: number, numItemsInView: number) {
    this.currentScrollIndex = currentScrollIndex;
    const renderScrollIndex = this.getRenderableScrollIndex(currentScrollIndex, numItemsInView);
    const maxRenderableIndex = Math.max(this._data.length - Math.ceil(numItemsInView), 0);
    let nextDataStart = renderScrollIndex > this.extraData ? renderScrollIndex - this.extraData : 0;
    const end = renderScrollIndex + numItemsInView + this.extraData;
    const nextDataEnd = end > this._data.length ? this._data.length : end;
    if (renderScrollIndex === maxRenderableIndex && nextDataEnd === this._data.length) {
      const desiredWindowSize = Math.min(this._data.length, Math.ceil(numItemsInView) + this.extraData * 2);
      nextDataStart = Math.max(0, nextDataEnd - desiredWindowSize);
    }
    if (nextDataStart === this.dataStart && nextDataEnd === this.dataEnd) {
      return;
    }
    this.dataStart = nextDataStart;
    this.dataEnd = nextDataEnd;
    const slicedData = this._data.slice(this.dataStart, this.dataEnd);
    this.visibleData.next(slicedData);
    this.viewport.setRenderedRange({ start: 0, end: slicedData.length });
    this.offsetChange.next(this.dataStart * this.itemSize);
    this.scheduleViewportSync();
  }

  private getRenderableScrollIndex(currentScrollIndex: number, numItemsInView: number): number {
    const maxRenderableIndex = Math.max(this._data.length - Math.ceil(numItemsInView), 0);
    return Math.max(0, Math.min(currentScrollIndex, maxRenderableIndex));
  }

  private shouldRequestMoreData(numItemsInView: number = this.getNumItemsInView()): boolean {
    const total = this._data.length ? this._data.length - 1 : 0;
    const endOfData = this.dataEnd;
    const endOfRender = this.currentScrollIndex + numItemsInView;
    return total > 0 && endOfData < endOfRender + this.bufferToEnd;
  }

  private scheduleViewportSync() {
    if (this.totalContentSizeSyncQueued) {
      return;
    }

    this.totalContentSizeSyncQueued = true;
    queueMicrotask(() => {
      this.totalContentSizeSyncQueued = false;
      this.suppressScrollEvents = true;
      this.viewport.setTotalContentSize(this.itemSize * this._data.length);
      queueMicrotask(() => {
        this.suppressScrollEvents = false;
      });
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<any[] | ReadonlyArray<any>> {
    return this.visibleData;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.indexChangeSub.unsubscribe();
  }
}
