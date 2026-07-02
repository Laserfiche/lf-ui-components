// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Renderer2 } from '@angular/core';
import { LfManagedVirtualScrollDirective, LfManagedVirtualScrollStrategy } from './lf-managed-virtual-scroll.directive';

function fakeRenderer() {
  return { setStyle: vi.fn() } as unknown as Renderer2;
}

describe('LfManagedVirtualScrollStrategy', () => {
  function fakeViewport(scrollOffset = 0, orientation: 'vertical' | 'horizontal' = 'vertical') {
    return {
      measureScrollOffset: () => scrollOffset,
      scrollToOffset: vi.fn(),
      orientation,
      elementRef: { nativeElement: { querySelector: () => null } },
    } as unknown as CdkVirtualScrollViewport;
  }

  function fakeViewportWithWrapper(orientation: 'vertical' | 'horizontal' = 'vertical') {
    const contentWrapper = document.createElement('div');
    return {
      viewport: {
        measureScrollOffset: () => 0,
        scrollToOffset: vi.fn(),
        orientation,
        elementRef: { nativeElement: { querySelector: () => contentWrapper } },
      } as unknown as CdkVirtualScrollViewport,
      contentWrapper,
    };
  }

  it('emits the scroll index based on scroll offset / item size', () => {
    const strategy = new LfManagedVirtualScrollStrategy(() => 42, fakeRenderer());
    const viewport = fakeViewport(42 * 100);
    strategy.attach(viewport);

    const emissions: number[] = [];
    strategy.scrolledIndexChange.subscribe((index) => emissions.push(index));

    strategy.onContentScrolled();

    expect(emissions).toEqual([100]);
  });

  it('does not emit duplicate scroll indices', () => {
    const strategy = new LfManagedVirtualScrollStrategy(() => 42, fakeRenderer());
    const viewport = fakeViewport(42 * 50);
    strategy.attach(viewport);

    const emissions: number[] = [];
    strategy.scrolledIndexChange.subscribe((index) => emissions.push(index));

    strategy.onContentScrolled();
    strategy.onContentScrolled();

    expect(emissions).toEqual([50]);
  });

  it('does nothing on rendered offset change so the consumer-managed offset is preserved', () => {
    const strategy = new LfManagedVirtualScrollStrategy(() => 42, fakeRenderer());
    const viewport = fakeViewport();
    strategy.attach(viewport);

    expect(() => strategy.onRenderedOffsetChanged()).not.toThrow();
    expect(() => strategy.onContentRendered()).not.toThrow();
    expect(() => strategy.onDataLengthChanged()).not.toThrow();
  });

  it('scrolls to the offset corresponding to the requested index', () => {
    const strategy = new LfManagedVirtualScrollStrategy(() => 42, fakeRenderer());
    const viewport = fakeViewport();
    strategy.attach(viewport);

    strategy.scrollToIndex(10, 'auto');

    expect(viewport.scrollToOffset).toHaveBeenCalledWith(10 * 42, 'auto');
  });

  it('does nothing while detached', () => {
    const strategy = new LfManagedVirtualScrollStrategy(() => 42, fakeRenderer());
    const emissions: number[] = [];
    strategy.scrolledIndexChange.subscribe((index) => emissions.push(index));

    strategy.onContentScrolled();
    strategy.scrollToIndex(5, 'auto');

    expect(emissions).toEqual([]);
  });

  it('ignores invalid item sizes', () => {
    const strategy = new LfManagedVirtualScrollStrategy(() => 0, fakeRenderer());
    const viewport = fakeViewport(42 * 100);
    strategy.attach(viewport);

    const emissions: number[] = [];
    strategy.scrolledIndexChange.subscribe((index) => emissions.push(index));

    strategy.onContentScrolled();

    expect(emissions).toEqual([]);
  });

  describe('applyRenderedOffset', () => {
    it('sets translateY on the content wrapper for a vertical viewport', () => {
      const renderer = fakeRenderer();
      const strategy = new LfManagedVirtualScrollStrategy(() => 42, renderer);
      const { viewport, contentWrapper } = fakeViewportWithWrapper('vertical');
      strategy.attach(viewport);

      strategy.applyRenderedOffset(420);

      expect(renderer.setStyle).toHaveBeenCalledWith(contentWrapper, 'transform', 'translateY(420px)');
    });

    it('sets translateX on the content wrapper for a horizontal viewport', () => {
      const renderer = fakeRenderer();
      const strategy = new LfManagedVirtualScrollStrategy(() => 42, renderer);
      const { viewport, contentWrapper } = fakeViewportWithWrapper('horizontal');
      strategy.attach(viewport);

      strategy.applyRenderedOffset(840);

      expect(renderer.setStyle).toHaveBeenCalledWith(contentWrapper, 'transform', 'translateX(840px)');
    });

    it('is a no-op when the content wrapper element is not found', () => {
      const renderer = fakeRenderer();
      const strategy = new LfManagedVirtualScrollStrategy(() => 42, renderer);
      strategy.attach(fakeViewport());

      strategy.applyRenderedOffset(420);

      expect(renderer.setStyle).not.toHaveBeenCalled();
    });

    it('is a no-op after detach', () => {
      const renderer = fakeRenderer();
      const strategy = new LfManagedVirtualScrollStrategy(() => 42, renderer);
      const { viewport } = fakeViewportWithWrapper();
      strategy.attach(viewport);
      strategy.detach();

      strategy.applyRenderedOffset(420);

      expect(renderer.setStyle).not.toHaveBeenCalled();
    });
  });
});

describe('LfManagedVirtualScrollDirective', () => {
  it('exposes a LfManagedVirtualScrollStrategy whose item size is driven by the directive input', () => {
    const directive = new LfManagedVirtualScrollDirective(fakeRenderer());
    directive.itemSize = 56;

    const viewport = {
      measureScrollOffset: () => 56 * 7,
      scrollToOffset: vi.fn(),
      orientation: 'vertical',
      elementRef: { nativeElement: { querySelector: () => null } },
    } as unknown as CdkVirtualScrollViewport;

    directive.scrollStrategy.attach(viewport);

    const emissions: number[] = [];
    directive.scrollStrategy.scrolledIndexChange.subscribe((index) => emissions.push(index));
    directive.scrollStrategy.onContentScrolled();

    expect(directive.scrollStrategy).toBeInstanceOf(LfManagedVirtualScrollStrategy);
    expect(emissions).toEqual([7]);

    directive.itemSize = 100;
    directive.scrollStrategy.scrollToIndex(3, 'auto');
    expect(viewport.scrollToOffset).toHaveBeenCalledWith(300, 'auto');
  });
});
