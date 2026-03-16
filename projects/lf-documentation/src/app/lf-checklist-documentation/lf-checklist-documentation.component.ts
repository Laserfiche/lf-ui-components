// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { AfterViewInit, Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  Checklist,
  LfChecklistComponent,
  LfChecklistService,
} from './../../../../ui-components/lf-checklist/lf-checklist-public-api';
import { LfChecklistDemoService } from './lf-checklist-demo.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-lf-checklist-documentation',
  templateUrl: './lf-checklist-documentation.component.html',
  styleUrls: ['./lf-checklist-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, LfChecklistComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfChecklistDocumentationComponent implements AfterViewInit {
  /** For custom element */
  elementActionButtonText: string = 'Element Submit';
  elementCancelButtonText: string = 'Element Cancel';
  elementOutput: string | undefined;
  elementChecklistService: LfChecklistService | undefined;
  elementCheckAllItemsOldValue: boolean = false;
  @ViewChild('checklist') elementChecklist!: LfChecklistComponent;

  constructor() {}

  async ngAfterViewInit() {
    this.elementChecklistService = new LfChecklistDemoService();
    await Promise.all([this.elementChecklist.initAsync({ checklistService: this.elementChecklistService })]);
  }

  /** Element event handlers */
  onElementActionClick(checklists: Checklist[]) {
    this.elementOutput = this.prettyPrint(checklists);
  }

  onElementCancelClick(checklists: Checklist[]) {
    this.elementOutput = undefined;
  }

  async onElementChecklistChanged(checklists: Checklist[]) {
    this.elementOutput = this.prettyPrint(checklists);
    const newValue: boolean = checklists[0].checklistOptions[2].checked;
    if (newValue && !this.elementCheckAllItemsOldValue && this.elementChecklistService) {
      (this.elementChecklistService as LfChecklistDemoService).checkFirstChecklistItems();
      await this.elementChecklist.initAsync({ checklistService: this.elementChecklistService });
    }
    this.elementCheckAllItemsOldValue = newValue;
  }

  private prettyPrint(value: any): string {
    return JSON.stringify(value, null, 2);
  }
}
