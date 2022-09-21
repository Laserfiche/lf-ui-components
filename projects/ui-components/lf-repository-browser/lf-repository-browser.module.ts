import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { LfRepositoryBrowserComponent } from './lf-repository-browser.component';
import { LfBreadcrumbsModule, LfLoaderModule } from '@laserfiche/lf-ui-components/shared';
import { LfSelectionListModule } from '@laserfiche/lf-ui-components/lf-selection-list';
import { FlatTreeComponentsModule } from '../tree-components/flat-tree-components/flat-tree-components.module';

@NgModule({
  declarations: [LfRepositoryBrowserComponent],
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    LfBreadcrumbsModule,
    LfLoaderModule,
    LfSelectionListModule,
    FlatTreeComponentsModule
  ],
  bootstrap: [LfRepositoryBrowserComponent],
  exports: [LfRepositoryBrowserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfRepositoryBrowserModule {
  /** @internal */
  constructor(/** @internal */ injector: Injector) {
    const repositoryExplorerElementName: string = 'lf-repository-browser';
    if (window.customElements && !customElements.get(repositoryExplorerElementName)) {
      const repoExplorerElement = createCustomElement(LfRepositoryBrowserComponent, { injector });
      customElements.define(repositoryExplorerElementName, repoExplorerElement);
    }
  }
}
