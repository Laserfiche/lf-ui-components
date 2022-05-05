import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ChecklistOption } from './checklist-option';

@Component({
  selector: 'lf-options-component',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OptionsComponent {

  @Input() options: ChecklistOption[] = [];
  @Output() optionsChanged: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  onOptionCheckboxChanged() {
    this.optionsChanged.emit();
  }
}
