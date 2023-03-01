import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { ILfSelectable } from '@laserfiche/lf-ui-components/shared';

const PAGESIZE = 50;
export const ROW_HEIGHT = 42;

export class GridTableDataSource extends DataSource<any> {
  private _data: ILfSelectable[];
  indexChangeSub: Subscription;
  curStart: number = 0;

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

  extraData: number = PAGESIZE/2;
  bufferToEnd: number = PAGESIZE/4;

  constructor(initialData: ILfSelectable[], private viewport: CdkVirtualScrollViewport, private itemSize: number) {
    super();
    this._data = initialData;
    this.viewport.setTotalContentSize(this.itemSize * initialData.length);
    this.visibleData.next(this._data.slice(0, PAGESIZE));

    this.indexChangeSub = this.viewport.scrolledIndexChange.subscribe((li) => {
      
      const rendered = this.viewport.elementRef.nativeElement.getBoundingClientRect().height / ROW_HEIGHT;
      if (li + rendered > (this.curStart + this.extraData - this.bufferToEnd) || (li > this.bufferToEnd ? li-this.bufferToEnd : 0) < this.curStart) {
        this.curStart = li;
        const slicedData = this._data.slice(li > this.extraData ? li-(this.extraData) : 0, li + rendered + this.extraData);
        this.visibleData.next(slicedData);
        this.offsetChange.next((li > this.extraData ? li-this.extraData: 0) * ROW_HEIGHT);
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
