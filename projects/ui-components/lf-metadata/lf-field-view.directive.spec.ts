import { LfFieldViewDirective } from './lf-field-view.directive';
import { ViewContainerRef, ViewRef, TemplateRef, EmbeddedViewRef, ComponentFactory, Injector, NgModuleRef, ComponentRef, ElementRef, Type } from '@angular/core';

describe('LfFieldViewDirective', () => {
  it('should create an instance', () => {
    const directive = new LfFieldViewDirective(new TestViewContainerRef());
    expect(directive).toBeTruthy();
  });
});

// mock view container ref to test directive
class TestViewContainerRef extends ViewContainerRef {
  createComponent<C>(componentType: Type<C>, options?: { index?: number | undefined; injector?: Injector | undefined; ngModuleRef?: NgModuleRef<unknown> | undefined; projectableNodes?: Node[][] | undefined; } | undefined): ComponentRef<C>;
  createComponent<C>(componentFactory: ComponentFactory<C>, index?: number | undefined, injector?: Injector | undefined, projectableNodes?: any[][] | undefined, ngModuleRef?: NgModuleRef<any> | undefined): ComponentRef<C>;
  createComponent<C>(componentFactory: unknown, index?: unknown, injector?: unknown, projectableNodes?: unknown, ngModuleRef?: unknown): ComponentRef<C> | ComponentRef<C> {
    throw new Error('Method not implemented.');
  }
  get element(): ElementRef<any> {
    throw new Error('Method not implemented.');
  }
  get injector(): Injector {
    throw new Error('Method not implemented.');
  }
  get parentInjector(): Injector {
    throw new Error('Method not implemented.');
  }
  clear(): void {
    throw new Error('Method not implemented.');
  }
  get(index: number): ViewRef {
    throw new Error('Method not implemented.');
  }
  get length(): number {
    throw new Error('Method not implemented.');
  }
  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
    EmbeddedViewRef<C> {
    throw new Error('Method not implemented.');
  }

  insert(viewRef: ViewRef, index?: number): ViewRef {
    throw new Error('Method not implemented.');
  }
  move(viewRef: ViewRef, currentIndex: number): ViewRef {
    throw new Error('Method not implemented.');
  }
  indexOf(viewRef: ViewRef): number {
    throw new Error('Method not implemented.');
  }
  remove(index?: number): void {
    throw new Error('Method not implemented.');
  }
  detach(index?: number): ViewRef {
    throw new Error('Method not implemented.');
  }
}
