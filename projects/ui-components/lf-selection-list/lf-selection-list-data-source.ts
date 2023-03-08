import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { ILfSelectable } from '@laserfiche/lf-ui-components/shared';

const PAGESIZE = 50;

export class GridTableDataSource extends DataSource<any> {
  private _data: ILfSelectable[];
  indexChangeSub: Subscription;
  currentScrollIndex: number = 0;
  dataStart: number = 0;
  dataEnd: number = 0;

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
    this.visibleData.next(this._data.slice(0, PAGESIZE));
    this.viewport.scrollTo({ top: 0 });
  }

  offset = 0;
  offsetChange = new BehaviorSubject(0);

  extraData: number = PAGESIZE / 2;
  bufferToEnd: number = PAGESIZE / 4;

  constructor(initialData: ILfSelectable[], private viewport: CdkVirtualScrollViewport, private itemSize: number) {
    super();
    this._data = initialData;
    this.viewport.setTotalContentSize(this.itemSize * initialData.length);
    this.visibleData.next(this._data.slice(0, PAGESIZE));

    this.indexChangeSub = this.viewport.scrolledIndexChange.subscribe((currentScrollIndex) => {
      const numItemsInView = this.viewport.elementRef.nativeElement.getBoundingClientRect().height / this.itemSize;
      const scrollPastEndOfData = currentScrollIndex + numItemsInView > this.dataEnd - this.bufferToEnd;
      const startAccountingForBuffer =
        currentScrollIndex > this.bufferToEnd ? currentScrollIndex - this.bufferToEnd : 0;
      const scrollBeforeStartOfData = startAccountingForBuffer < this.currentScrollIndex;
      if (scrollPastEndOfData || scrollBeforeStartOfData) {
        this.currentScrollIndex = currentScrollIndex;
        this.dataStart = currentScrollIndex > this.extraData ? currentScrollIndex - this.extraData : 0;
        this.dataEnd = currentScrollIndex + numItemsInView + this.extraData;
        const slicedData = this._data.slice(this.dataStart, this.dataEnd);
        this.visibleData.next(slicedData);
        this.offsetChange.next(this.dataStart * this.itemSize);
      }
    });
  }

  private readonly visibleData: BehaviorSubject<ILfSelectable[]> = new BehaviorSubject<ILfSelectable[]>([]);

  connect(collectionViewer: CollectionViewer): Observable<any[] | ReadonlyArray<any>> {
    return this.visibleData;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.indexChangeSub.unsubscribe();
  }
}
