// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfFieldInfo, LfFieldValue } from '../../../utils/lf-field-types';

@Component({
  selector: 'lf-field-base-component',
  templateUrl: './lf-field-base.component.html',
  styleUrls: ['./lf-field-base.component.css']
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
