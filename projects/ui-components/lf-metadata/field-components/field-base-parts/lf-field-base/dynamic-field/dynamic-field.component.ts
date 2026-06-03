// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'lf-dynamic-field-component',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
})
export class DynamicFieldComponent {
  @Input() options: string[] | undefined = undefined;
  @Input() formControl!: FormControl;
  @Input() title: string | undefined;
  @Input() fieldValidationErrorMsg: Observable<string | undefined> | undefined;
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
