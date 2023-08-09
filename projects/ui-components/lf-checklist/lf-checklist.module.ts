import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { LfChecklistComponent } from './lf-checklist/lf-checklist.component';
import { ItemsComponent } from './items/items.component';
import { OptionsComponent } from './options/options.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { BrowserModule } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';
import { createCustomElement } from '@angular/elements';
import { ItemsValidationTextPipe } from './items/items-validation-text.pipe';

@NgModule({
  declarations: [
    LfChecklistComponent,
    ItemsComponent,
    OptionsComponent,
    ItemsValidationTextPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatExpansionModule
  ],
  exports: [
    LfChecklistComponent
  ],
  providers: [],
  bootstrap: [LfChecklistComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfChecklistModule {
  /** @internal */
  constructor(
    /** @internal */ injector: Injector
  ) {
    const elementName: string = 'lf-checklist';
    if (window.customElements && !customElements.get(elementName)) {
      const newElement = createCustomElement(LfChecklistComponent, { injector });
      customElements.define(elementName, newElement);
    }
  }
}
