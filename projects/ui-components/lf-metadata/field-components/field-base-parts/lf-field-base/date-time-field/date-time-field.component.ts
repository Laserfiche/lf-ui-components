// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { UntypedFormGroup, UntypedFormControl, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher, DateAdapter  } from '@angular/material/core';
import moment from 'moment';
import { AppLocalizationService, ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfMetadataDatetimeUtils } from '@laserfiche/lf-js-utils';
import { Observable } from 'rxjs';
import { LocaleDatetimeUtils } from '../locale-datetime-utils';
import { LfFieldTokenService } from '../lf-field-token.service';
import { map } from 'rxjs/operators';
import { UniComponentConfig, UniComponentSettings} from '../../../../lf-date-time-picker/uni-date-time.common'
import {UniDateTimeComponent} from '../../../../lf-date-time-picker/uni-date-time.component'
@Component({
  selector: 'lf-date-time-field-component',
  templateUrl: './date-time-field.component.html',
  styleUrls: ['./date-time-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: DateTimeFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ]
})
export class DateTimeFieldComponent extends BaseFieldDirective implements OnInit {
  shouldEnableMeridian: boolean = false;
  private readonly LOCALE_DATE_TIME = this.localizationService.languageChanged().pipe(map((language) => {
    return LocaleDatetimeUtils.getLocaleDateTimePattern(language);
  }));
  private readonly DATETIME_FIELDS_MUST_BE_IN_THE_FORMAT_0 = this.localizationService.getStringLaserficheWithObservableParams('DATE_TIME_FIELDS_MUST_BE_IN_FORMAT_0', [this.LOCALE_DATE_TIME]);

  @Input() set form(value: UntypedFormGroup) {
    this._form = value;
    this._form.addControl('testCases', new UntypedFormControl(5, [Validators.min(1), Validators.max(50)]))
    this._form.valueChanges.subscribe((changes) => {
    })
  };
  get form() {
    return this._form;
  };
  @ViewChild("newStartDatePicker") newStartDatePicker?: UniDateTimeComponent;
  private _form!: UntypedFormGroup;
  uniDateConfig: UniComponentConfig;
  startDateSettings: UniComponentSettings;
  constructor(
    public tokenService: LfFieldTokenService,
    private dateAdapter: DateAdapter<any> ,
    public ref: ChangeDetectorRef,
    public localizationService: AppLocalizationService) {
    super(tokenService, ref, localizationService);
    this.dateAdapter.setLocale(navigator.language);
    this.shouldEnableMeridian = true;
    moment.locale(navigator.language);

    const locale =  moment.locale(navigator.language);
    const internalDateFormat = 'MM/DD/YYYY';
    const internalTimeFormat = 'HH:mm';
    this.uniDateConfig = {
      storedValueDateFormat: internalDateFormat,
      storedValueTimeFormat: internalTimeFormat,
      storedValueDateTimeFormat: '{DATE}T{TIME}',
      defaultDateFormat: internalDateFormat,
      defaultTimeFormat: internalTimeFormat,
      language: navigator.language,
      locale: locale,
      setDisplayFormatByLocale: true, // auto sets (display) dateFormat and timeFormat
      setDisplayFormatByLocaleSeconds: false,
      silent: true // no internal strings and no custom error messages
    };
    this.startDateSettings = {
      showTime: true,
      showLabel: false,
      label: 'startDate',
      readOnly: false,
    };
  }

  compareDateStrings = LfMetadataDatetimeUtils.compareDateStrings;

  serializeFieldFormControlValue(): string {
    if (this.containsToken) {
      return this.getLfFieldFormControlValue();
    }
    const fieldControlValue = this.getLfFieldFormControlValue();
    if (!fieldControlValue) {
      return '';
    }
    else {
      const date: Date = new Date(fieldControlValue);
      const serializedDate: string = LfMetadataDatetimeUtils.serializeDateValue(date) ?? '';
      return serializedDate;
    }
  }

  deserializeLfFieldValue(): string {
    return this.lf_field_value ?? '';
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    return [];
  }

  getValidationTextForFieldType(validationRuleName: ValidationRule): Observable<string> | undefined {
    switch (validationRuleName) {
      case ValidationRule.MAT_DATETIME_PICKER_PARSE:
        return this.DATETIME_FIELDS_MUST_BE_IN_THE_FORMAT_0;
      case ValidationRule.MAT_DATEPICKER_PARSE:
        return this.DATETIME_FIELDS_MUST_BE_IN_THE_FORMAT_0;
    }
    return undefined;
  }
  onDateTimePickerChange(event: any) {
    const pickerName = event.component.settings.label;
    const controlType = (event.controlType == 'dateTime-date') ? 'Date' : 'Time';
    const newTimeStr = event.component.dateTimeControl.value ? event.component.dateTimeControl.value.split('T')[1] : event.newValue.timeStr;
    switch (pickerName) {
      case 'startDate':
        // this.form.get('start' + controlType).setValue(controlType == 'Date' ? event.newValue.dateTimeObj : newTimeStr);
        break;
      case 'endDate':
        const endControls = this.form.get('end') as UntypedFormGroup;
        // endControls.get('end' + controlType).setValue(controlType == 'Date' ? event.newValue.dateTimeObj : newTimeStr);
        break;
    }
  }
  onPickerIconClick(event: any) {
    setTimeout(() => {
      switch (event.event) {
        case 'DateIconClick':
          event.component.date.toggle();
          break;
        case 'TimeIconClick':
          event.component.time.toggle();
          break;
      }
    }, 100);
  }
  ngAfterViewInit() {
    if (this.newStartDatePicker) {
      this.newStartDatePicker.setDateTime(this.form.get('startDate')?.value, this.form.get('startTime')?.value);
      this.newStartDatePicker.updateSettings({ readOnly: this.form.get('startDate')?.disabled });

    }
  }

}
