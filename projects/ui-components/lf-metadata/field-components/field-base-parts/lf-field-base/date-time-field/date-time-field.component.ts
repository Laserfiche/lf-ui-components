import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import moment from 'moment';
import { NgxMatDateAdapter, NgxMatDatetimePicker } from '@angular-material-components/datetime-picker';
import { LfMetadataDatetimeUtils } from '@laserfiche/lf-js-utils';
import { Observable } from 'rxjs';
import { LocaleDatetimeUtils } from '../locale-datetime-utils';
import { LfFieldTokenService } from '../lf-field-token.service';
import { map } from 'rxjs/operators';
import { AppLocalizationService, ValidationRule } from './../../../../../internal-shared/internal-shared-public-api';

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

  @ViewChild('picker') picker?: NgxMatDatetimePicker<any>;

  constructor(
    public tokenService: LfFieldTokenService,
    private dateAdapter: NgxMatDateAdapter<any>,
    public ref: ChangeDetectorRef,
    public localizationService: AppLocalizationService,
    private zone: NgZone) {
    super(tokenService, ref, localizationService);
    this.dateAdapter.setLocale(navigator.language);
    this.shouldEnableMeridian = true;
    moment.locale(navigator.language);
  }

  onTogglePicker() {
    this.zone.run(() => {
      this.picker?.open();
    });
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
    }
    return undefined;
  }
}
