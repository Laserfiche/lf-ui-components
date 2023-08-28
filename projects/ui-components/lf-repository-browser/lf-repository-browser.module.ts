import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { LfRepositoryBrowserComponent } from './lf-repository-browser.component';
import { LfBreadcrumbsModule } from '@laserfiche/lf-ui-components/shared';
import { LfLoaderModule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfSelectionListModule } from '@laserfiche/lf-ui-components/lf-selection-list';

@NgModule({
  declarations: [LfRepositoryBrowserComponent],
  imports: [
    CommonModule,
    FormsModule,
    LfBreadcrumbsModule,
    LfLoaderModule,
    LfSelectionListModule,
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
