import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeFieldComponent } from './time-field.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldInfo } from '../../../utils/lf-field-types';
import { AppLocalizationService,ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfFieldTokenService } from '../lf-field-token.service';
import { FieldType, FieldFormat } from '@laserfiche/lf-ui-components/shared';
import { LfTokenPickerComponent } from '../../lf-token-picker/lf-token-picker.component';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreUtils } from '@laserfiche/lf-js-utils';

describe('TimeFieldComponent', () => {
  let requiredTimeComponent: TimeFieldComponent;
  let requiredTimeFixture: ComponentFixture<TimeFieldComponent>;

  let optionalTimeComponent: TimeFieldComponent;
  let optionalTimeFixture: ComponentFixture<TimeFieldComponent>;

  const requiredTime: LfFieldInfo = {
    name: 'requiredTimeName',
    id: 1,
    description: 'requiredTimeDescription',
    isRequired: true,
    fieldType: FieldType.Time,
    format: FieldFormat.ShortTime,
    displayName: 'requiredTimeName'
  };

  const optionalTime: LfFieldInfo = {
    name: 'optionalTimeName',
    id: 2,
    description: 'optionalTimeDescription',
    fieldType: FieldType.Time,
    format: FieldFormat.LongTime,
    displayName: 'optionalTimeName'
  };

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TimeFieldComponent,
        LfTokenPickerComponent
      ],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        ReactiveFormsModule,
        NgxMatDatetimePickerModule,
        NgxMatNativeDateModule,
        MatDatepickerModule
      ],
      providers:[
        LfFieldTokenService,
        AppLocalizationService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    requiredTimeFixture = TestBed.createComponent(TimeFieldComponent);
    requiredTimeComponent = requiredTimeFixture.componentInstance;
    requiredTimeComponent.lf_field_info = requiredTime;
    requiredTimeComponent.lf_field_form_control = new FormControl();
    requiredTimeFixture.detectChanges();

    optionalTimeFixture = TestBed.createComponent(TimeFieldComponent);
    optionalTimeComponent = optionalTimeFixture.componentInstance;
    optionalTimeComponent.lf_field_info = optionalTime;
    optionalTimeComponent.lf_field_form_control = new FormControl();
    optionalTimeFixture.detectChanges();
  });

  it('should create required Time field', () => {
    expect(requiredTimeComponent).toBeTruthy();
  });

  it('should create optional Time field', () => {
    expect(optionalTimeComponent).toBeTruthy();
  });

  it('should have validation error if required field is blank', async () => {
    const expectedError = requiredTimeComponent.localizationService.getString('REQUIRED_FIELD_IS_EMPTY');
    let value: string | undefined;
    requiredTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should not have validation error if optional field is blank', async () => {
    expect(optionalTimeComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    optionalTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    optionalTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should validate time pattern', async () => {
    // arrange
    const valueBadPattern: string = '05';

    // act
    requiredTimeComponent.setLfFieldFormControlValue(valueBadPattern);
    requiredTimeFixture.detectChanges();

    // assert
    const expectedBrokenRule = ValidationRule.TIME;
    const expectedError = requiredTimeComponent.localizationService.getString('TIME_FIELDS_MUST_BE_IN_FORMAT_0', ['HH:mm:ss']);
    expect(requiredTimeComponent.getBrokenValidationRule()).toEqual(expectedBrokenRule);
    let value: string | undefined;
    requiredTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should update fieldFormControl dynamically', async () => {
    // arrange
    const validTime = '01:14:13 AM';

    // act
    requiredTimeComponent.setLfFieldFormControlValue(validTime);
    requiredTimeFixture.detectChanges();

    // assert
    expect(requiredTimeComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    requiredTimeComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    requiredTimeComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should deserialize lfFieldValue as expected', () => {
    requiredTimeComponent.lf_field_value = 'test Value';
    const deserializedValue = requiredTimeComponent.deserializeLfFieldValue();
    expect(deserializedValue).toEqual('test Value');
  });

  it('should include seconds if format is LongTime', () => {
    expect(optionalTimeComponent.lf_field_info.format).toEqual(FieldFormat.LongTime);
    expect(optionalTimeComponent.step).toEqual('1');
  });

  it('should not include seconds if format is ShortTime', () => {
    expect(requiredTimeComponent.lf_field_info.format).toEqual(FieldFormat.ShortTime);
    expect(requiredTimeComponent.step).toBeUndefined();
  });

});
