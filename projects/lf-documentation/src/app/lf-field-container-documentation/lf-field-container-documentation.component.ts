// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { AfterViewInit, Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LfFieldContainerComponent } from './../../../../ui-components/lf-metadata/lf-field-container/public-api';
import { FieldType } from './../../../../ui-components/shared/lf-shared-public-api';
import { LfFieldContainerDemoService } from './lf-field-container-demo.service';
import { CardComponent } from '../card/card.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lf-field-container-documentation',
  templateUrl: './lf-field-container-documentation.component.html',
  styleUrls: ['./lf-field-container-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, MatCheckboxModule, FormsModule, LfFieldContainerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfFieldContainerDocumentationComponent implements AfterViewInit {
  elementIsCollapsible: boolean = false;
  @ViewChild('fieldContainer') elementComponent!: LfFieldContainerComponent;

  constructor() {}

  async ngAfterViewInit(): Promise<void> {
    const componentService = new LfFieldContainerDemoService();
    await this.elementComponent.initAsync(componentService, 2);
    await this.elementComponent.updateFieldValuesAsync([
      {
        fieldId: 13,
        values: [
          {
            value: '2021-10-13T11:29:58',
            position: '1',
          },
        ],
        fieldName: 'Time Received',
        fieldType: FieldType.DateTime,
      },
    ]);
  }

  onFieldValueChange(isValid: boolean) {
    console.log('field value changed! all fields valid: ', isValid);
  }

  onTemplateSelectedChanged(templateId: number) {
    console.log('template selected changed! template ID: ', templateId);
  }
}
