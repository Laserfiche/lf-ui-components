import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling'
import { createCustomElement } from '@angular/elements';

import { LfListComponent } from './lf-list.component';
import { LfListOptionComponent } from './lf-list-option.component';
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({
  declarations: [
    LfListComponent,
    LfListOptionComponent
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    ScrollingModule,

  ],
  bootstrap: [LfListComponent],
  exports: [LfListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfListModule { 
  // constructor(
  //   /** @internal */ injector: Injector
  // ) {
  //   const repositoryExplorerElementName: string = 'lf-repository-browser';
  //   if (window.customElements && !customElements.get(repositoryExplorerElementName)) {
  //     const repoExplorerElement = createCustomElement(LfRepositoryBrowserComponent, { injector });
  //     customElements.define(repositoryExplorerElementName, repoExplorerElement);
  //   }
  // }
}
