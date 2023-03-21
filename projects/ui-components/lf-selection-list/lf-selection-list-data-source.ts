import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subscription, BehaviorSubject, Observable, Subject } from 'rxjs';
import { ILfSelectable } from '@laserfiche/lf-ui-components/shared';

export class GridSelectionListDataSource extends DataSource<any> {
  private _data: ILfSelectable[];
  private readonly visibleData: BehaviorSubject<ILfSelectable[]> = new BehaviorSubject<ILfSelectable[]>([]);

  checkForData: Subject<void> = new Subject<void>();
  indexChangeSub: Subscription;
  currentScrollIndex: number = 0;
  dataStart: number = 0;
  dataEnd: number = 0;
  
  offset = 0;
  offsetChange = new BehaviorSubject(0);

  extraData: number = this.pageSize / 2;
  bufferToEnd: number = this.pageSize / 4;

  get allData(): ILfSelectable[] {
    return this._data.slice();
  }

  set allData(data: ILfSelectable[]) {
    const existingData = this._data;
    this._data = data;
    this.viewport.setTotalContentSize(this.itemSize * this._data.length);
    if (!existingData || existingData.length === 0) {
      this.resetView();
    }
  }

  private resetView() {
    this.dataStart = 0;
    this.dataEnd = this.pageSize;
    this.visibleData.next(this._data.slice(this.dataStart, this.dataEnd));
    this.viewport.scrollTo({ top: 0 });
  }

  constructor(initialData: ILfSelectable[], private viewport: CdkVirtualScrollViewport, private itemSize: number, public pageSize: number) {
    super();
    this._data = initialData;
    this.viewport.setTotalContentSize(this.itemSize * initialData.length);
    this.dataStart = 0;
    this.dataEnd = this.pageSize;
    this.visibleData.next(this._data.slice(this.dataStart, this.dataEnd));

    this.indexChangeSub = this.viewport.scrolledIndexChange.subscribe((currentScrollIndex) => {
      const numItemsInView = this.viewport.elementRef.nativeElement.getBoundingClientRect().height / this.itemSize;
      const scrollPastEndOfData = currentScrollIndex + numItemsInView > this.dataEnd - this.bufferToEnd;
      const startAccountingForBuffer =
        currentScrollIndex > this.bufferToEnd ? currentScrollIndex - this.bufferToEnd : 0;
      const scrollBeforeStartOfData = startAccountingForBuffer < this.currentScrollIndex;
      if (scrollPastEndOfData || scrollBeforeStartOfData) {
        this.currentScrollIndex = currentScrollIndex;
        this.dataStart = currentScrollIndex > this.extraData ? currentScrollIndex - this.extraData : 0;
        const end = currentScrollIndex + numItemsInView + this.extraData;
        this.dataEnd = end > this._data.length ? this._data.length : end;
        const slicedData = this._data.slice(this.dataStart, this.dataEnd);
        this.visibleData.next(slicedData);
        this.offsetChange.next(this.dataStart * this.itemSize);
      }

      // If the viewport is at the end we should try and pull more data
      const total = this._data.length ? this._data.length - 1 : 0;
      const endOfData = this.dataEnd;
      const endOfRender = currentScrollIndex + numItemsInView;
      if (total > 0 && endOfData < endOfRender + this.bufferToEnd) {
        this.checkForData.next();
      }
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<any[] | ReadonlyArray<any>> {
    return this.visibleData;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.indexChangeSub.unsubscribe();
  }
}
