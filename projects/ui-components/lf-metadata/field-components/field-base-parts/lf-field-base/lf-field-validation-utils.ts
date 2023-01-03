import { ValidatorFn, Validators } from '@angular/forms';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { ValidationUtils } from '@laserfiche/lf-ui-components/internal-shared';
import { LfMetadataValidationUtils } from '@laserfiche/lf-js-utils';
import { LfFieldInfo } from '../../utils/lf-field-types';

export class LfFieldValidationUtils extends ValidationUtils {
    static getDefaultValidators(lfFieldInfo: LfFieldInfo): ValidatorFn[] {
        const validators: ValidatorFn[] = [];
        if (lfFieldInfo.isRequired) {
            const requiredRegexValidator = ValidationUtils.requiredValidator();
            validators.push(requiredRegexValidator);
        }
        if (lfFieldInfo.length) {
            validators.push(Validators.maxLength(lfFieldInfo.length));
        }
        if (lfFieldInfo.constraint) {
            if (
                lfFieldInfo.fieldType === FieldType.Number ||
                lfFieldInfo.fieldType === FieldType.LongInteger ||
                lfFieldInfo.fieldType === FieldType.ShortInteger
            ) {
                validators.push(this.numericValidator(lfFieldInfo.constraint));
            }
            else {
                const cleanedConstraint: string = LfMetadataValidationUtils.formatTextConstraint(lfFieldInfo.constraint);
                validators.push(this.generalRegexValidator(new RegExp(cleanedConstraint)));
            }
        }
        return validators;
    }
}

