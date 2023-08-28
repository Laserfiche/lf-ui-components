import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'lf-dynamic-field-component',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.css', './../lf-field-base/lf-field-base.component.css'],
})
export class DynamicFieldComponent {
  @Input() options: string[] = [];
  @Input() formControl!: FormControl;
  @Input() title: string | undefined;
  @Input() fieldValidationErrorMsg!: Observable<string> | undefined;
  @Input() getBrokenValidationRule!: () => ValidationRule | undefined;
  @Output() valueChange = new EventEmitter();

  /**
   * Default compare implementation, can be overrided by @Input
   */
  @Input() compareWith = (first: string, second: string) => {
    return first === second;
  };

  constructor() {}

  onValueChanged() {
    this.valueChange.emit();
  }
}
