// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LfFieldTemplateContainerComponent, LfFieldTemplateProviders } from './../../../../ui-components/lf-metadata/lf-field-template-container/public-api';
import { LfFieldTemplateContainerDemoService, TemplateIds } from './../../../../ui-components/lf-metadata/lf-field-template-container/lf-field-template-container-demo.service';

@Component({
  selector: 'app-lf-field-template-container-documentation',
  templateUrl: './lf-field-template-container-documentation.component.html',
  styleUrls: ['./lf-field-template-container-documentation.component.css', './../app.component.css']
})
export class LfFieldTemplateContainerDocumentationComponent implements AfterViewInit {

  @ViewChild('templateContainer') elementTemplateContainer!: ElementRef<LfFieldTemplateContainerComponent>;
  readonly demoService = new LfFieldTemplateContainerDemoService();
  templateProviders: LfFieldTemplateProviders = {
    templateFieldContainerService: this.demoService
  };

  readonly defaultComponentTemplateId = TemplateIds.DynamicLocation;

  constructor() { }

  async ngAfterViewInit() : Promise<void> {
    await this.elementTemplateContainer.nativeElement.initAsync(this.templateProviders, 6);
  }

  logElementInfo() {
    console.log(this.elementTemplateContainer.nativeElement.forceValidation());
    console.log(this.elementTemplateContainer.nativeElement.getTemplateValue());
  }

  async clearElementAsync() {
    await this.elementTemplateContainer.nativeElement.clearAsync();
  }
}
