// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ChecklistOption } from './checklist-option';

@Component({
  selector: 'lf-options-component',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css', './../lf-checklist/lf-checklist.component.css'],  
})
export class OptionsComponent {

  @Input() options: ChecklistOption[] = [];
  @Output() optionsChanged: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  onOptionCheckboxChanged() {
    this.optionsChanged.emit();
  }
}
