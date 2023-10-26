// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ValidatorFn, FormControl } from '@angular/forms';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfFieldInfo } from '../../utils/lf-field-types';
import { LfFieldValidationUtils } from './lf-field-validation-utils';

describe('LfFieldValidationUtils', () => {
    it('should create "required" validator if field is required', () => {
        const requiredFieldInfo: LfFieldInfo = {
            name: 'requiredField',
            id: 1,
            description: 'this field is required',
            fieldType: FieldType.String,
            isRequired: true,
            displayName: 'requiredField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(requiredFieldInfo);
        const fc: FormControl = new FormControl('', validators);
        expect(fc.hasError('required')).toBeTrue();
    });

    it('should not create "required" validator if field is not required', () => {
        const optionalFieldInfo: LfFieldInfo = {
            name: 'optionalField',
            id: 1,
            description: 'this field is optional',
            fieldType: FieldType.String,
            isRequired: false,
            displayName: 'optionalField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(optionalFieldInfo);
        const fc: FormControl = new FormControl('', validators);
        expect(fc.hasError('required')).toBeFalse();
    });

    it('should create "maxlength" validator if field has a length', () => {
        const maxLengthFieldInfo: LfFieldInfo = {
            name: 'maxLengthField',
            id: 1,
            description: 'this field has a max length',
            fieldType: FieldType.String,
            length: 4,
            displayName: 'maxLengthField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(maxLengthFieldInfo);
        const fc: FormControl = new FormControl('12345', validators);
        expect(fc.hasError('maxlength')).toBeTrue();
    });

    it('should not create "maxlength" validator if field does not have a length', () => {
        const noMaxLengthFieldInfo: LfFieldInfo = {
            name: 'noMaxLengthField',
            id: 1,
            description: 'this field has no max length',
            fieldType: FieldType.String,
            displayName: 'noMaxLengthField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(noMaxLengthFieldInfo);
        const fc: FormControl = new FormControl('12345', validators);
        expect(fc.hasError('maxlength')).toBeFalse();
    });

    it('should create "pattern" validator if field is text and has a constraint', () => {
        const twoNumberFieldInfo: LfFieldInfo = {
            name: 'twoNumberField',
            id: 1,
            description: 'this field only accepts 2 numbers',
            fieldType: FieldType.String,
            constraint: '^[0-9]{2}[:.,-]?$',
            constraintError: 'Two digit number only.',
            displayName: 'twoNumberField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(twoNumberFieldInfo);
        const fc: FormControl = new FormControl('123', validators);
        expect(fc.hasError('pattern')).toBeTrue();
    });

    it('should create "numeric" validator if field is Number and has a constraint', () => {
        const twoNumberFieldInfo: LfFieldInfo = {
            name: 'twoNumberField',
            id: 1,
            description: 'this field only accepts 2 numbers',
            fieldType: FieldType.Number,
            constraint: '>=10 AND <=99',
            constraintError: 'Must be between 10 and 99, inclusive.',
            displayName: 'twoNumberField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(twoNumberFieldInfo);
        const fc: FormControl = new FormControl('123', validators);
        expect(fc.hasError('numeric')).toBeTrue();
    });

    it('should create "numeric" validator if field is LongInteger and has a constraint', () => {
        const twoNumberFieldInfo: LfFieldInfo = {
            name: 'twoNumberField',
            id: 1,
            description: 'this field only accepts 2 numbers',
            fieldType: FieldType.LongInteger,
            constraint: '>=10 AND <=99',
            constraintError: 'Must be between 10 and 99, inclusive.',
            displayName: 'twoNumberField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(twoNumberFieldInfo);
        const fc: FormControl = new FormControl('123', validators);
        expect(fc.hasError('numeric')).toBeTrue();
    });

    it('should create "numeric" validator if field is ShortInteger and has a constraint', () => {
        const twoNumberFieldInfo: LfFieldInfo = {
            name: 'twoNumberField',
            id: 1,
            description: 'this field only accepts 2 numbers',
            fieldType: FieldType.ShortInteger,
            constraint: '>=10 AND <=99',
            constraintError: 'Must be between 10 and 99, inclusive.',
            displayName: 'twoNumberField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(twoNumberFieldInfo);
        const fc: FormControl = new FormControl('123', validators);
        expect(fc.hasError('numeric')).toBeTrue();
    });

    it('should not create "pattern" validator if text field has no regex constraint', () => {
        const noConstraintFieldInfo: LfFieldInfo = {
            name: 'noConstraintField',
            id: 1,
            description: 'this field has no constraint',
            fieldType: FieldType.String,
            displayName: 'noConstraintField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(noConstraintFieldInfo);
        const fc: FormControl = new FormControl('123', validators);
        expect(fc.hasError('pattern')).toBeFalse();
    });

    it('should not create "numeric" validator if numeric field has no regex constraint', () => {
        const noConstraintFieldInfo: LfFieldInfo = {
            name: 'noConstraintField',
            id: 1,
            description: 'this field has no constraint',
            fieldType: FieldType.Number,
            displayName: 'noConstraintField'
        };
        const validators: ValidatorFn[] = LfFieldValidationUtils.getDefaultValidators(noConstraintFieldInfo);
        const fc: FormControl = new FormControl('123', validators);
        expect(fc.hasError('numeric')).toBeFalse();
    });

});

