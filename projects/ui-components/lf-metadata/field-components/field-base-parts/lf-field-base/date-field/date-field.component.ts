import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import {
  DateAdapter,
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@angular/material/core';
import { ValidatorFn } from '@angular/forms';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS
} from '@angular/material-moment-adapter';
import { LfFieldTokenService } from '../lf-field-token.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { AppLocalizationService, ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfMetadataDatetimeUtils } from '@laserfiche/lf-js-utils';
import { Observable } from 'rxjs';
import { LocaleDatetimeUtils } from '../locale-datetime-utils';
import { map } from 'rxjs/operators';

@Component({
  selector: 'lf-date-field-component',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: DateFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { strict: true } }
  ]
})
export class DateFieldComponent extends BaseFieldDirective implements OnInit {
  private readonly LOCALE_DATE = this.localizationService.languageChanged().pipe(map((language) => {
    return LocaleDatetimeUtils.getLocaleDatePattern(language);
  }));
  private readonly DATE_FIELDS_MUST_BE_IN_THE_FORMAT_0 = this.localizationService.getStringLaserficheWithObservableParams('DATE_FIELDS_MUST_BE_IN_FORMAT_0', [this.LOCALE_DATE]);

  constructor(
    public tokenService: LfFieldTokenService,
    private dateAdapter: DateAdapter<any>,
    public ref: ChangeDetectorRef,
    public localizationService: AppLocalizationService,
    private zone: NgZone
  ) {
    super(tokenService, ref, localizationService);
    this.dateAdapter.setLocale(navigator.language);
  }
  @ViewChild('picker') picker?: MatDatepicker<any>;

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
    return LfMetadataDatetimeUtils.deserializeDateValue(this.lf_field_value);
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    return [];
  }

  getValidationTextForFieldType(validationRuleName: ValidationRule): Observable<string> | undefined {
    switch (validationRuleName) {
      case ValidationRule.MAT_DATEPICKER_PARSE:
        return this.DATE_FIELDS_MUST_BE_IN_THE_FORMAT_0;
    }
    return undefined;
  }
}
