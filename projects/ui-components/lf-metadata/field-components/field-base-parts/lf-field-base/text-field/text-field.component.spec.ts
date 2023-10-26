// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TextFieldComponent } from './text-field.component';
import { LfFieldInfo } from '../../../utils/lf-field-types';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldTokenService } from '../lf-field-token.service';
import { AppLocalizationService, ValidationRule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfTokenService } from '../../lf-token-picker/lf-token.service';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfTokenPickerComponent } from '../../lf-token-picker/lf-token-picker.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreUtils } from '@laserfiche/lf-js-utils';

describe('TextFieldComponent', () => {
  let shortComponent: TextFieldComponent;
  let shortFixture: ComponentFixture<TextFieldComponent>;

  let longComponent: TextFieldComponent;
  let longFixture: ComponentFixture<TextFieldComponent>;

  let noLengthComponent: TextFieldComponent;
  let noLengthFixture: ComponentFixture<TextFieldComponent>;


  const shortStringTextInfo: LfFieldInfo = {
    name: 'Short String',
    id: 1,
    description: 'This field has a max length of 40',
    fieldType: FieldType.String,
    isRequired: true,
    length: 40,
    displayName: 'Short String'
  };

  const longStringTextInfo: LfFieldInfo = {
    name: 'Long String',
    id: 2,
    description: 'This field has a max length of 200',
    fieldType: FieldType.String,
    length: 200,
    displayName: 'Long String'
  };

  const textWithNoLengthInfo: LfFieldInfo = {
    name: 'No Length Text',
    id: 3,
    description: 'This field has no max length specified',
    fieldType: FieldType.String,
    displayName: 'No Length Text'
  };

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextFieldComponent,
        LfTokenPickerComponent
      ],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: BaseFieldDirective, useExisting: TextFieldComponent },
        { provide: LfTokenService, useClass: LfFieldTokenService },
        AppLocalizationService
      ]
    }).compileComponents();

    shortFixture = TestBed.createComponent(TextFieldComponent);
    shortComponent = shortFixture.componentInstance;
    shortComponent.lf_field_info = shortStringTextInfo;
    shortComponent.lf_field_form_control = new FormControl();
    shortFixture.detectChanges();

    longFixture = TestBed.createComponent(TextFieldComponent);
    longComponent = longFixture.componentInstance;
    longComponent.lf_field_info = longStringTextInfo;
    longComponent.lf_field_form_control = new FormControl();
    longFixture.detectChanges();

    noLengthFixture = TestBed.createComponent(TextFieldComponent);
    noLengthComponent = noLengthFixture.componentInstance;
    noLengthComponent.lf_field_info = textWithNoLengthInfo;
    noLengthComponent.lf_field_form_control = new FormControl();
    noLengthFixture.detectChanges();
  }));

  it('should create short text field', () => {
    expect(shortComponent).toBeTruthy();
  });

  it('should create long text field', () => {
    expect(longComponent).toBeTruthy();
  });

  it('should create text field with no length', () => {
    expect(noLengthComponent).toBeTruthy();
  });

  it('should show validation error for required field with no value', async () => {
    const expectedError = shortComponent.localizationService.getString('REQUIRED_FIELD_IS_EMPTY');
    let value: string | undefined;
    shortComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    shortComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should not show validation error for optional field with no value', async () => {
    expect(longComponent.getBrokenValidationRule()).toBeUndefined();
    let value: string | undefined;
    longComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    longComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should not show validation error when required field has valid value', async () => {
    shortComponent.setLfFieldFormControlValue('a real short value');
    let value: string | undefined;
    shortComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    shortComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should not show validation error when optional field has valid value', async () => {
    longComponent.setLfFieldFormControlValue('a real long value');
    let value: string | undefined;
    longComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    longComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should show validation error when short field has over 40 characters', async () => {
    shortComponent.setLfFieldFormControlValue('12345678901234567890123456789012345678901');
    shortFixture.detectChanges();

    const expectedBrokenRule = ValidationRule.MAX_LENGTH;
    const lengthParam: string[] = [shortStringTextInfo?.length?.toString() ?? '0'];
    const expectedError: string = shortComponent.localizationService.getString('THIS_FIELD_HAS_MAXIMUM_ALLOWED_LENGTH_0_CHARACTERS', lengthParam);
    expect(shortComponent.getBrokenValidationRule()).toEqual(expectedBrokenRule);
    let value: string | undefined;
    shortComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    shortComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should not show validation error when long field has over 40 characters', async () => {
    longComponent.setLfFieldFormControlValue('12345678901234567890123456789012345678901');
    let value: string | undefined;
    longComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    longComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === undefined,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toBeUndefined();
  });

  it('should show validation error when long field has over character limit', async () => {
    longComponent.setLfFieldFormControlValue(
      `12345678901234567890123456789012345678901234567890
      12345678901234567890123456789012345678901234567890
      12345678901234567890123456789012345678901234567890
      123456789012345678901234567890123456789012345678901`
    );
    longFixture.detectChanges();

    const expectedBrokenRule = ValidationRule.MAX_LENGTH;
    const lengthParam: string[] = [longStringTextInfo?.length?.toString() ?? '0'];
    const expectedError: string = longComponent.localizationService.getString('THIS_FIELD_HAS_MAXIMUM_ALLOWED_LENGTH_0_CHARACTERS', lengthParam);
    expect(longComponent.getBrokenValidationRule()).toEqual(expectedBrokenRule);
    let value: string | undefined;
    longComponent.fieldValidationErrorMsg.subscribe((val) => {
      value = val;
    });
    // needed to trigger first value of subscription
    longComponent.lf_field_form_control.updateValueAndValidity();
    await CoreUtils.waitForConditionAsync(
      () => value === expectedError,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedError);
  });

  it('should use input for length 40 and under', () => {
    expect(shortComponent.isShortField).toBeTrue();
  });

  it('should use textarea for length over 40', () => {
    expect(longComponent.isShortField).toBeFalse();
  });

  it('should use input for text field with no length', () => {
    expect(noLengthComponent.isShortField).toBeTrue();
  });

  it('should NOT detect token if field does not contain token', async () => {
    const stringFieldWithToken = 'Parent name is: %(pname)';
    shortComponent.setLfFieldFormControlValue(stringFieldWithToken);
    shortFixture.detectChanges();

    const containsToken = shortComponent.containsToken;
    expect(containsToken).toBeFalse();
  });

  it('should detect token if field contains token', async () => {
    const stringFieldWithToken = 'Parent name is: %(parentname)';
    shortComponent.setLfFieldFormControlValue(stringFieldWithToken);
    shortFixture.detectChanges();

    const containsToken = shortComponent.containsToken;
    expect(containsToken).toBeTrue();
  });

  it('should detect token if field contains token with uppercase', async () => {
    const stringFieldWithToken = 'Parent name is: %(ParentName)';
    shortComponent.setLfFieldFormControlValue(stringFieldWithToken);
    shortFixture.detectChanges();

    const containsToken = shortComponent.containsToken;
    expect(containsToken).toBeTrue();
  });

  it('should add token to the end of the field if there is no cursor position', async () => {
    const stringField = 'Parent name is: ';
    shortComponent.setLfFieldFormControlValue(stringField);
    shortFixture.detectChanges();

    const newValue = shortComponent.createNewFieldValueWithToken('ParentName');
    expect(newValue).toEqual('Parent name is:%(ParentName)');
  });

  it('should detect token if field contains token with colon', async () => {
    const stringFieldWithToken = 'Parent name is: %(parent:name)';
    shortComponent.setLfFieldFormControlValue(stringFieldWithToken);
    shortFixture.detectChanges();

    const containsToken = shortComponent.containsToken;
    expect(containsToken).toBeTrue();
  });
});
