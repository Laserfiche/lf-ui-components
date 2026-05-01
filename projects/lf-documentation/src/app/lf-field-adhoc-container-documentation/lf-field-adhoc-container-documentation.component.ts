// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, AfterViewInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LfFieldAdhocContainerComponent } from './../../../../ui-components/lf-metadata/lf-field-adhoc-container/public-api';
import { LfFieldAdhocContainerDemoService } from './lf-field-adhoc-container-demo.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-lf-field-adhoc-container-documentation',
  templateUrl: './lf-field-adhoc-container-documentation.component.html',
  styleUrls: ['./lf-field-adhoc-container-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, LfFieldAdhocContainerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfFieldAdhocContainerDocumentationComponent implements AfterViewInit {
  @ViewChild('adhocContainer') elementAdhocContainer!: LfFieldAdhocContainerComponent;
  elementIsValid: boolean = false;

  constructor() {}

  async ngAfterViewInit() {
    const componentService = new LfFieldAdhocContainerDemoService();
    await this.elementAdhocContainer.initAsync(componentService);
    await this.elementAdhocContainer.resetFieldDataAsync(componentService.mappedFields);
  }

  elementForceValidation() {
    console.log(this.elementAdhocContainer.forceValidation());
  }

  elementGetFieldValues() {
    console.log(this.elementAdhocContainer.getFieldValues());
  }

  async elementClearFieldValuesAsync() {
    await this.elementAdhocContainer.clearAsync();
  }

  onElementFieldValueChange(isValid: boolean) {
    this.elementIsValid = isValid;
  }
}
