import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Checklist, LfChecklistComponent, LfChecklistService } from '@laserfiche/types-laserfiche-ui-components';
import { LfChecklistDemoService } from './lf-checklist-demo.service';

@Component({
  selector: 'app-lf-checklist-documentation',
  templateUrl: './lf-checklist-documentation.component.html',
  styleUrls: ['./lf-checklist-documentation.component.css', './../app.component.css']
})
export class LfChecklistDocumentationComponent implements AfterViewInit {
  /** For custom element */
  elementActionButtonText: string = 'Element Submit';
  elementCancelButtonText: string = 'Element Cancel';
  elementOutput: string | undefined;
  elementChecklistService: LfChecklistService | undefined;
  elementCheckAllItemsOldValue: boolean = false;
  @ViewChild('checklist') elementChecklist!: ElementRef<LfChecklistComponent>;

  constructor() { }

  async ngAfterViewInit() {
    this.elementChecklistService = new LfChecklistDemoService();
    await Promise.all([
      this.elementChecklist.nativeElement.initAsync({ checklistService: this.elementChecklistService }),
    ]);
  }

  /** Element event handlers */
  onElementActionClick(event: CustomEvent<Checklist[]>) {
    this.elementOutput = this.prettyPrint(event.detail);
  }

  onElementCancelClick(event: CustomEvent<Checklist[]>) {
    this.elementOutput = undefined;
  }

  async onElementChecklistChanged(event: CustomEvent<Checklist[]>) {
    this.elementOutput = this.prettyPrint(event.detail);
    const newValue: boolean = event.detail[0].checklistOptions[2].checked;
    if (newValue && !this.elementCheckAllItemsOldValue && this.elementChecklistService) {
      (this.elementChecklistService as LfChecklistDemoService).checkFirstChecklistItems();
      await this.elementChecklist.nativeElement.initAsync({ checklistService: this.elementChecklistService });
    }
    this.elementCheckAllItemsOldValue = newValue;
  }

  private prettyPrint(value: any): string {
    return JSON.stringify(value, null, 2);
  }

}
