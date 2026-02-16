// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Directive, OnInit } from '@angular/core';
import { BaseFieldDirective } from './base-field.directive';
import { ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { of } from 'rxjs';
import {
  UniComponentConfig,
  UniComponentSettings,
} from '../../../../lf-date-time-picker/uni-date-time.common';
import { UniDateTimeComponent } from '../../../../lf-date-time-picker/uni-date-time.component';

@Directive()
export abstract class DateTimeBaseFieldDirective extends BaseFieldDirective implements OnInit {
  protected readonly internalDateFormat: string = 'YYYY-MM-DD';
  protected readonly internalTimeFormat: string = 'HH:mm:ss';
  uniDateTimeConfig!: UniComponentConfig;
  uniDateTimeSettings!: UniComponentSettings;

  onUniDateOrTimeChanged(dateTimeObject: { component: UniDateTimeComponent }) {
    if (dateTimeObject?.component) {
      this.ref.detectChanges();
      this.setLfDateTimeFieldControl(dateTimeObject);
      this.showTokenTextBox = false;
      this.onValueChanged(true);
    }
  }

  private setLfDateTimeFieldControl(dateTimeObject: { component: UniDateTimeComponent }) {
    if (dateTimeObject.component.dateTimeControl?.value) {
      this.setLfFieldFormControlValue(dateTimeObject.component.dateTimeControl?.value);
      this.lf_field_form_control.updateValueAndValidity();
    } else if (!!dateTimeObject.component.settings.showTimeOnly) {
      this.setLfFieldFormControlValue(undefined);
      this.lf_field_form_control.updateValueAndValidity();
    } else {
      this.setDateOrDateTimeValidationErrors(dateTimeObject);
    }
  }

  private setDateOrDateTimeValidationErrors(dateTimeObject: { component: UniDateTimeComponent }) {
    if (dateTimeObject.component.dateControl?.value && dateTimeObject.component.dateControl?.value.trim() !== '') {
      this.setLfFieldFormControlValue(dateTimeObject.component.dateControl?.value);
      if (!!dateTimeObject.component.settings.combinedDateTime) {
        var dateTimeFormat: string =
          dateTimeObject.component.settings.dateFormat + ' ' + dateTimeObject.component.settings.timeFormat;
        this.lf_field_form_control.setErrors({
          [ValidationRule.DATETIME_PICKER_PARSE]: {
            text: dateTimeObject.component.dateControl?.value,
            dateTimeFormat: dateTimeFormat,
          },
        });
      } else {
        this.lf_field_form_control.setErrors({
          [ValidationRule.DATEPICKER_PARSE]: {
            text: dateTimeObject.component.dateControl?.value,
            dateTimeFormat: dateTimeObject.component.settings.dateFormat,
          },
        });
      }
    } else {
      this.setLfFieldFormControlValue(undefined);
      this.lf_field_form_control.updateValueAndValidity();
    }
    const validationRuleName = this.getBrokenValidationRule();
    this.fieldValidationErrorMsg = this.getValidationErrorMsg(validationRuleName) ?? of(undefined);
  }

  protected getDateTimePickerDefaultDateValue(): string | undefined {
    var initialDate: string | undefined;
    if (!!this.containsToken) {
      this.showTokenTextBox = true;
      return (initialDate = undefined);
    } else {
      return (initialDate = this.lf_field_value);
    }
  }
}
