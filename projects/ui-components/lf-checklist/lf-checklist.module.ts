// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { LfChecklistComponent } from './lf-checklist/lf-checklist.component';
import { ItemsComponent } from './items/items.component';
import { OptionsComponent } from './options/options.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
