// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, AfterViewInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  LfFieldTemplateContainerComponent,
  LfFieldTemplateProviders,
} from './../../../../ui-components/lf-metadata/lf-field-template-container/public-api';
import {
  LfFieldTemplateContainerDemoService,
  TemplateIds,
} from './../../../../ui-components/lf-metadata/lf-field-template-container/lf-field-template-container-demo.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-lf-field-template-container-documentation',
  templateUrl: './lf-field-template-container-documentation.component.html',
  styleUrls: ['./lf-field-template-container-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, LfFieldTemplateContainerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfFieldTemplateContainerDocumentationComponent implements AfterViewInit {
  @ViewChild('templateContainer') elementTemplateContainer!: LfFieldTemplateContainerComponent;
  readonly demoService = new LfFieldTemplateContainerDemoService();
  templateProviders: LfFieldTemplateProviders = {
    templateFieldContainerService: this.demoService,
  };

  readonly defaultComponentTemplateId = TemplateIds.DynamicLocation;

  constructor() {}

  async ngAfterViewInit(): Promise<void> {
    if (this.elementTemplateContainer?.initAsync) {
      await this.elementTemplateContainer.initAsync(this.templateProviders, 6);
    }
  }

  logElementInfo() {
    console.log(this.elementTemplateContainer.forceValidation());
    console.log(this.elementTemplateContainer.getTemplateValue());
  }

  async clearElementAsync() {
    await this.elementTemplateContainer.clearAsync();
  }
}
