import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling'
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LfRepositoryBrowserComponent } from './lf-repository-browser.component';
import { LfBreadcrumbsModule, LfLoaderModule } from '@laserfiche/lf-ui-components/shared';
import { LfListModule } from './lf-list.module';


@NgModule({
  declarations: [
    LfRepositoryBrowserComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    MatListModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    ScrollingModule,
    LfBreadcrumbsModule,
    LfLoaderModule,
    LfListModule
  ],
  bootstrap: [LfRepositoryBrowserComponent],
  exports: [LfRepositoryBrowserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfRepositoryBrowserModule { 
  constructor(
    /** @internal */ injector: Injector
  ) {
    const repositoryExplorerElementName: string = 'lf-repository-browser';
    if (window.customElements && !customElements.get(repositoryExplorerElementName)) {
      const repoExplorerElement = createCustomElement(LfRepositoryBrowserComponent, { injector });
      customElements.define(repositoryExplorerElementName, repoExplorerElement);
    }
  }
}
