import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { LfFieldContainerComponent } from './lf-field-container/lf-field-container.component';
import { LfFieldAddRemoveComponent } from './lf-field-adhoc-container/lf-field-add-remove/lf-field-add-remove.component';
import { LfFieldAdhocContainerComponent } from './lf-field-adhoc-container/lf-field-adhoc-container.component';
import { LfFieldTemplateContainerComponent } from './lf-field-template-container/lf-field-template-container.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createCustomElement } from '@angular/elements';
import { LfLoaderModule, LfModalsModule } from '@laserfiche/lf-ui-components/internal-shared';
import { FieldComponentsModule } from './field-components/field-components.module';
import { GetFieldTypePipe } from './lf-field-adhoc-container/lf-field-add-remove/get-field-type.pipe';
import { LfFieldViewDirective } from './lf-field-view.directive';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

@NgModule({
  declarations: [
    LfFieldAdhocContainerComponent,
    LfFieldTemplateContainerComponent,
    LfFieldAddRemoveComponent,
    LfFieldContainerComponent,
    GetFieldTypePipe,
    LfFieldViewDirective
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule,
    FieldComponentsModule,
    ReactiveFormsModule,
    LfModalsModule,
    LfLoaderModule,
    ScrollingModule,
    MatDialogModule
  ],
  bootstrap: [
    LfFieldAdhocContainerComponent,
    LfFieldTemplateContainerComponent,
    LfFieldContainerComponent
  ],
  exports: [
    LfFieldAdhocContainerComponent,
    LfFieldTemplateContainerComponent,
    LfFieldContainerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LfMetadataModule {
  /** @internal */
  constructor(
    /** @internal */ injector: Injector
  ) {
    const templateElementName: string = 'lf-field-template-container';
    if (window.customElements && !customElements.get(templateElementName)) {
      // Convert component to a custom element.
      const LfFieldTemplateContainerElement = createCustomElement(LfFieldTemplateContainerComponent, { injector });

      // Register the custom element with the browser.
      customElements.define(templateElementName, LfFieldTemplateContainerElement);
    }

    const adhocElementName: string = 'lf-field-adhoc-container';
    if (window.customElements && !customElements.get(adhocElementName)) {
      const newElement = createCustomElement(LfFieldAdhocContainerComponent, { injector });
      customElements.define(adhocElementName, newElement);
    }

    const fieldContainerElementName: string = 'lf-field-container';
    if (window.customElements && !customElements.get(fieldContainerElementName)) {
      const lfFieldContainerElement = createCustomElement(LfFieldContainerComponent, { injector });
      customElements.define(fieldContainerElementName, lfFieldContainerElement);
    }
  }
}
