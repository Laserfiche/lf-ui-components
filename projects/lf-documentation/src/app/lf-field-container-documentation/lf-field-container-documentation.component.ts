import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { LfFieldContainerComponent } from './../../../../ui-components/lf-metadata/lf-field-container/public-api';
import { FieldType } from './../../../../ui-components/shared/lf-shared-public-api';
import { LfFieldContainerDemoService } from './lf-field-container-demo.service';

@Component({
  selector: 'app-lf-field-container-documentation',
  templateUrl: './lf-field-container-documentation.component.html',
  styleUrls: ['./lf-field-container-documentation.component.css', './../app.component.css']
})
export class LfFieldContainerDocumentationComponent implements AfterViewInit {

  elementIsCollapsible: boolean = false;
  @ViewChild('fieldContainer') elementComponent!: ElementRef<LfFieldContainerComponent>;

  constructor() { }

  async ngAfterViewInit(): Promise<void> {
    const componentService = new LfFieldContainerDemoService();
      await this.elementComponent.nativeElement.initAsync(componentService, 2);
      await this.elementComponent.nativeElement.updateFieldValuesAsync([
        {
          fieldId: 13,
          values: [
            {
              value: '2021-10-13T11:29:58',
              position: '1'
            }
          ],
          fieldName: 'Time Received',
          fieldType: FieldType.DateTime,
        }
      ]);
  }

  onFieldValueChange(isValid: boolean) {
    console.log('field value changed! all fields valid: ', isValid);
  }

  onTemplateSelectedChanged(templateId: number) {
    console.log('template selected changed! template ID: ', templateId);
  }

}
