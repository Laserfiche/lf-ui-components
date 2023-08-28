import { ValidatorFn, AbstractControl } from '@angular/forms';
import { LfMetadataValidationUtils } from '@laserfiche/lf-js-utils';

/** @internal */
export enum ValidationRule {
    LONG_INT = 'longint',
    MAX_LENGTH = 'maxlength',
    NUMBER = 'number',
    PATTERN = 'pattern',
    NUMERIC = 'numeric',
    REQUIRED = 'required',
    SHORT_INT = 'shortint',
    TIME = 'time',
    MAT_DATEPICKER_PARSE = 'matDatepickerParse',
    MAT_DATETIME_PICKER_PARSE = 'matDatetimePickerParse'
}

// @dynamic
/** @internal */
export class ValidationUtils {

    /** Only one error will be displayed at a time (in this priority order) */
    static validationRulesInPriorityOrder: ValidationRule[] = [
        ValidationRule.MAT_DATEPICKER_PARSE,
        ValidationRule.MAT_DATETIME_PICKER_PARSE,
        ValidationRule.TIME,
        ValidationRule.REQUIRED,
        ValidationRule.MAX_LENGTH,
        ValidationRule.PATTERN,
        ValidationRule.NUMERIC,
        ValidationRule.NUMBER,
        ValidationRule.LONG_INT,
        ValidationRule.SHORT_INT,
    ];

    static numericValidator(constraint: string): ValidatorFn {
        const validatorFn: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
            // Don't try to match regex if there is no value
            if (!control.value) {
                return null;
            }
            const validationFailedExplanation = { numeric: { value: control.value } };
            const matchesConstraint = LfMetadataValidationUtils.evaluateNumericValidationExpression(control.value, constraint);
            return matchesConstraint ? null : validationFailedExplanation;
        };
        return validatorFn;
    }

    static generalRegexValidator(regex: RegExp, ruleName?: string): ValidatorFn {
        const validatorFn: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
            // Don't try to match regex if there is no value
            if (!control.value) {
                return null;
            }
            ruleName = ruleName ?? ValidationRule.PATTERN; // default regex validation key
            const validationFailedExplanation = {
                [ruleName]: { value: control.value },
            };
            const matchesRegex = regex.test(control.value);
            return matchesRegex ? null : validationFailedExplanation;
        };
        return validatorFn;
    }

    static requiredValidator(): ValidatorFn {
        const validatorFn: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
            // Don't try to match regex if there is no value
            const validationFailedExplanation = {
                ['required']: { value: control.value },
            };
            if (!control.value) {
                return validationFailedExplanation;
            }
            const isEmptyString = ValidationUtils.isEmpty(control.value);
            return isEmptyString ? validationFailedExplanation : null;
        };
        return validatorFn;
    }
    static isEmpty(str: string): boolean {
      const trimmed = str.trim();
      return trimmed.length === 0;
    }

    static createTimeValidator(): ValidatorFn {
        const regexAMPM: string = `([0][0-9]|[1][0-2]):[0-5][0-9]:[0-5][0-9] ([AMP]){2}`;
        const regex24Hour: string = `([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]`;
        const regexNoSeconds: string = `([01]?[0-9]|2[0-3]):[0-5][0-9]`;
        const timePattern = new RegExp(`${regexAMPM}|${regex24Hour}|${regexNoSeconds}`);
        return ValidationUtils.generalRegexValidator(timePattern, 'time');
    }
}
