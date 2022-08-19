import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfBreadcrumbsComponent } from './lf-breadcrumbs.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    LfBreadcrumbsComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonToggleModule
  ],
  exports: [
    LfBreadcrumbsComponent
  ]
})
export class LfBreadcrumbsModule {
  constructor(private injector: Injector) {
    const breadcrumbsElementName: string = 'lf-breadcrumbs';
    if (window.customElements && !customElements.get(breadcrumbsElementName)) {
      const breadcrumbsElement = createCustomElement(LfBreadcrumbsComponent, { injector });
      customElements.define(breadcrumbsElementName, breadcrumbsElement);
    }
  }
}
