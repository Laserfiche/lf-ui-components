import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LfFieldAdhocContainerComponent } from './../../../../ui-components/lf-metadata/lf-field-adhoc-container/public-api';
import { LfFieldAdhocContainerDemoService } from './lf-field-adhoc-container-demo.service';

@Component({
  selector: 'app-lf-field-adhoc-container-documentation',
  templateUrl: './lf-field-adhoc-container-documentation.component.html',
  styleUrls: ['./lf-field-adhoc-container-documentation.component.css', './../app.component.css']
})
export class LfFieldAdhocContainerDocumentationComponent implements AfterViewInit {

  @ViewChild('adhocContainer') elementAdhocContainer!: ElementRef<LfFieldAdhocContainerComponent>;
  elementIsValid: boolean = false;

  constructor() { }

  async ngAfterViewInit() {
    const componentService = new LfFieldAdhocContainerDemoService();
    await this.elementAdhocContainer.nativeElement.initAsync(componentService);
    await this.elementAdhocContainer.nativeElement.resetFieldDataAsync(componentService.mappedFields);
  }

  elementForceValidation() {
    console.log(this.elementAdhocContainer.nativeElement.forceValidation());
  }

  elementGetFieldValues() {
    console.log(this.elementAdhocContainer.nativeElement.getFieldValues());
  }

  async elementClearFieldValuesAsync() {
    await this.elementAdhocContainer.nativeElement.clearAsync();
  }

  onElementFieldValueChange(isValid: CustomEvent<boolean>) {
    this.elementIsValid = isValid.detail;
  }
}
