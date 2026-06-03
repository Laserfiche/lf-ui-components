// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Subject } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ILfSelectable } from '@laserfiche/lf-ui-components/shared';
import { GridSelectionListDataSource } from './lf-selection-list-data-source';

describe('GridSelectionListDataSource', () => {
  function createItems(length: number): ILfSelectable[] {
    return Array.from({ length }, (_, index) => ({
      isSelectable: true,
      isSelected: false,
      value: { id: `${index}` },
    }));
  }

  function createViewport(height: number = 420) {
    const scrolledIndexChange = new Subject<number>();
    return {
      scrolledIndexChange,
      setTotalContentSize: vi.fn(),
      setRenderedRange: vi.fn(),
      scrollTo: vi.fn(),
      elementRef: {
        nativeElement: {
          scrollTop: 0,
          getBoundingClientRect: () => ({ height }),
        },
      },
    } as unknown as CdkVirtualScrollViewport;
  }

  function emitScrollIndex(viewport: CdkVirtualScrollViewport, index: number) {
    (viewport.scrolledIndexChange as Subject<number>).next(index);
  }

  it('extends the rendered slice when more data is appended near the end of the current range', () => {
    const viewport = createViewport();
    const dataSource = new GridSelectionListDataSource(createItems(50), viewport, 42, 50);
    const renderedRanges: string[][] = [];

    dataSource.connect({} as never).subscribe((data) => {
      renderedRanges.push(data.map((item) => item.value.id));
    });

    emitScrollIndex(viewport, 40);
    viewport.elementRef.nativeElement.scrollTop = 40 * 42;
    dataSource.allData = createItems(100);

    expect(renderedRanges.at(-1)?.at(0)).toBe('15');
    expect(renderedRanges.at(-1)?.at(-1)).toBe('74');
  });

  it('refreshes the rendered slice from the actual viewport offset when appended data arrives after scroll index lags', () => {
    const viewport = createViewport();
    const dataSource = new GridSelectionListDataSource(createItems(86), viewport, 42, 50);
    const renderedRanges: string[][] = [];

    dataSource.connect({} as never).subscribe((data) => {
      renderedRanges.push(data.map((item) => item.value.id));
    });

    emitScrollIndex(viewport, 50);
    viewport.elementRef.nativeElement.scrollTop = 81 * 42;
    dataSource.allData = createItems(106);

    expect(renderedRanges.at(-1)?.at(0)).toBe('56');
    expect(renderedRanges.at(-1)?.at(-1)).toBe('105');
  });

  it('clamps the rendered slice to the loaded tail when the viewport index overshoots loaded data', () => {
    const viewport = createViewport();
    const dataSource = new GridSelectionListDataSource(createItems(86), viewport, 42, 50);
    const renderedRanges: string[][] = [];

    dataSource.connect({} as never).subscribe((data) => {
      renderedRanges.push(data.map((item) => item.value.id));
    });

    viewport.elementRef.nativeElement.scrollTop = 200 * 42;
    emitScrollIndex(viewport, 200);

    expect(renderedRanges.at(-1)?.length).toBeGreaterThan(0);
    expect(renderedRanges.at(-1)?.at(0)).toBe('26');
    expect(renderedRanges.at(-1)?.at(-1)).toBe('85');
  });

  it('uses integer rendered ranges when the viewport height is not an exact multiple of item size', () => {
    const viewport = createViewport(401);
    const dataSource = new GridSelectionListDataSource(createItems(10000), viewport, 42, 50);

    emitScrollIndex(viewport, 9990);

    expect(dataSource.dataStart).toBe(9940);
    expect(dataSource.dataEnd).toBe(10000);
    expect(viewport.setRenderedRange).toHaveBeenLastCalledWith({ start: 0, end: 60 });
  });

  it('resyncs total content size after the rendered window shifts without bouncing the current index', async () => {
    const scrolledIndexChange = new Subject<number>();
    let emitReentrantScroll = false;
    const viewport = {
      scrolledIndexChange,
      setTotalContentSize: vi.fn(() => {
        if (emitReentrantScroll) {
          scrolledIndexChange.next(30);
        }
      }),
      setRenderedRange: vi.fn(),
      setRenderedContentOffset: vi.fn(),
      scrollTo: vi.fn(),
      elementRef: {
        nativeElement: {
          getBoundingClientRect: () => ({ height: 420 }),
        },
      },
    } as unknown as CdkVirtualScrollViewport;
    const dataSource = new GridSelectionListDataSource(createItems(60), viewport, 42, 50);

    vi.mocked(viewport.setTotalContentSize).mockClear();
    emitReentrantScroll = true;
    scrolledIndexChange.next(45);
    await Promise.resolve();
    await Promise.resolve();

    expect(dataSource.currentScrollIndex).toBe(45);
    expect(dataSource.dataStart).toBe(20);
    expect(dataSource.dataEnd).toBe(60);
    expect(viewport.setTotalContentSize).toHaveBeenCalledWith(60 * 42);
  });

  it('requests more data at most once for the same loaded length', () => {
    const viewport = createViewport();
    const dataSource = new GridSelectionListDataSource(createItems(60), viewport, 42, 50);
    const checkForDataSpy = vi.fn();

    dataSource.checkForData.subscribe(checkForDataSpy);

    (viewport.scrolledIndexChange as Subject<number>).next(45);
    (viewport.scrolledIndexChange as Subject<number>).next(45);
    (viewport.scrolledIndexChange as Subject<number>).next(44);

    expect(checkForDataSpy).toHaveBeenCalledTimes(1);

    dataSource.allData = createItems(80);
    (viewport.scrolledIndexChange as Subject<number>).next(65);

    expect(checkForDataSpy).toHaveBeenCalledTimes(2);
  });

  it('tracks the absolute dataset window while keeping the viewport range relative to the rendered slice', () => {
    const viewport = createViewport();
    const dataSource = new GridSelectionListDataSource(createItems(200), viewport, 42, 50);

    emitScrollIndex(viewport, 120);

    expect(dataSource.dataStart).toBe(95);
    expect(dataSource.dataEnd).toBe(155);
    expect(viewport.setRenderedRange).toHaveBeenLastCalledWith({ start: 0, end: 60 });
  });

  it('re-asserts the rendered range and offset on every scroll tick even when the slice is unchanged', () => {
    const viewport = createViewport();
    const dataSource = new GridSelectionListDataSource(createItems(200), viewport, 42, 50);
    const offsets: number[] = [];
    dataSource.offsetChange.subscribe((offset) => offsets.push(offset));

    emitScrollIndex(viewport, 120);
    const setRangeCallsAfterFirstScroll = vi.mocked(viewport.setRenderedRange).mock.calls.length;
    const offsetCallsAfterFirstScroll = offsets.length;

    // Re-emit the same index repeatedly (CDK does this after each scroll event
    // even when the underlying slice does not need to change).
    emitScrollIndex(viewport, 120);
    emitScrollIndex(viewport, 120);

    expect(vi.mocked(viewport.setRenderedRange).mock.calls.length).toBeGreaterThan(setRangeCallsAfterFirstScroll);
    expect(offsets.length).toBeGreaterThan(offsetCallsAfterFirstScroll);
    expect(offsets.at(-1)).toBe(dataSource.dataStart * 42);
  });
});
