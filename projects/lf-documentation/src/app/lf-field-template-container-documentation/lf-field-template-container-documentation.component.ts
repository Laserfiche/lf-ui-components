import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LfFieldTemplateContainerComponent, LfFieldTemplateProviders } from '@laserfiche/types-lf-ui-components';
import { LfFieldTemplateContainerDemoService, TemplateIds } from './lf-field-template-container-demo.service';

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
    await this.elementTemplateContainer.nativeElement.initAsync(this.templateProviders);
  }

  logElementInfo() {
    console.log(this.elementTemplateContainer.nativeElement.forceValidation());
    console.log(this.elementTemplateContainer.nativeElement.getTemplateValue());
  }

  async clearElementAsync() {
    await this.elementTemplateContainer.nativeElement.clearAsync();
  }
}
