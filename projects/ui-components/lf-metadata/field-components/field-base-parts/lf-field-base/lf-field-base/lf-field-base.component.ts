// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfFieldInfo, LfFieldValue } from '../../../utils/lf-field-types';
import { DateTimeFieldComponent } from '../date-time-field/date-time-field.component';
import { TextFieldComponent } from '../text-field/text-field.component';
import { DateFieldComponent } from '../date-field/date-field.component';
import { NumberFieldComponent } from '../number-field/number-field.component';
import { ListFieldComponent } from '../list-field/list-field.component';
import { TimeFieldComponent } from '../time-field/time-field.component';

@Component({
    selector: 'lf-field-base-component',
    templateUrl: './lf-field-base.component.html',
    styleUrls: ['./lf-field-base.component.css'],
    standalone: true,
    imports: [CommonModule, DateTimeFieldComponent, TextFieldComponent, DateFieldComponent, NumberFieldComponent, ListFieldComponent, TimeFieldComponent]
})
export class LfFieldBaseComponent {
  @Input() lfFieldInfo!: LfFieldInfo;
  @Input() lfFieldFormControl!: FormControl;
  @Input() lfFieldValue: LfFieldValue | undefined;
  @Input() parentForm: FormGroup | undefined;
  @Input() isImportMode: boolean = false;
  @Input() dynamicFieldValueOptions: string[] | undefined;
  @Output() fieldValueChange = new EventEmitter<LfFieldValue>();

  constructor() { }

  onChange(event: LfFieldValue) {
    this.fieldValueChange.emit(event);
  }

  get fieldTypeString() {
    return FieldType.String;
  }

  get fieldTypeDate() {
    return FieldType.Date;
  }

  get fieldTypeDateTime() {
    return FieldType.DateTime;
  }

  get fieldTypeList() {
    return FieldType.List;
  }

  get fieldTypeLongInteger() {
    return FieldType.LongInteger;
  }

  get fieldTypeNumber() {
    return FieldType.Number;
  }

  get fieldTypeShortInteger() {
    return FieldType.ShortInteger;
  }

  get fieldTypeTime() {
    return FieldType.Time;
  }
}
