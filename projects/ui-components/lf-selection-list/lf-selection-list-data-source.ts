import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { ILfSelectable } from '@laserfiche/lf-ui-components/shared';

const PAGESIZE = 20;
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

  constructor(initialData: ILfSelectable[], private viewport: CdkVirtualScrollViewport, private itemSize: number) {
    super();
    this._data = initialData;
    this.viewport.setTotalContentSize(this.itemSize * initialData.length);
    this.visibleData.next(this._data.slice(0, PAGESIZE));

    this.indexChangeSub = this.viewport.scrolledIndexChange.subscribe((li) => {
      const slicedData = this._data.slice(li, li + PAGESIZE);
      this.curStart = li;
      this.visibleData.next(slicedData);
      this.offsetChange.next(li * ROW_HEIGHT);
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
