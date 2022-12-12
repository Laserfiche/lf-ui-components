import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationRule } from './../../shared/validation-utils';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ChecklistItem } from './checklist-item';

/**
 * Pipe that gets the error message for a checklist item depending on the type of error
 */
@Pipe({
  name: 'itemsValidationText'
})
export class ItemsValidationTextPipe implements PipeTransform {

  constructor() { }

  private localizedStrings?: Map<string, Observable<string>>;

  /**
   * Gets the error message for the checklist item as an observable
   * @param currentChecklistItem The metadata for the current checklist item
   * @param currentFormControl The form control for the checklist item (i.e. value, validity)
   * @param localizedStrings Map of possible localized strings 
   * @returns The error message for the checklist item
   */
  transform(currentChecklistItem: ChecklistItem, currentFormControl: AbstractControl, localizedStrings: Map<string, Observable<string>>): Observable<string | undefined> {
    this.localizedStrings = localizedStrings;
    const validationObservable = this.getValidationObservable(currentChecklistItem, currentFormControl);
    return validationObservable;
  }

  private getValidationObservable(item: ChecklistItem, formControl: AbstractControl): Observable<string | undefined> {
    const validationObservable = formControl?.statusChanges.pipe(mergeMap((validity) => {

      const validationRuleName = this.getBrokenValidationRule(formControl);
      if (validationRuleName === ValidationRule.PATTERN) {
        return of(item?.constraintError);
      }
      if (validationRuleName === ValidationRule.REQUIRED && item.requiredError) {
        return of(item.requiredError);
      }
      const requiredString = this.localizedStrings?.get('REQUIRED');
      if (requiredString) {
        return requiredString?.pipe(map((stringVal) => {
          if (validationRuleName === ValidationRule.REQUIRED) {
            return item?.requiredError ? item.requiredError : stringVal;
          }
          else {
            return undefined;
          }
        }));
      }
      else {
        return of(undefined);
      }

    }));
    return validationObservable;

  }

  private getBrokenValidationRule(formControl: AbstractControl): string | undefined {
    if (formControl?.hasError(ValidationRule.PATTERN)) {
      return ValidationRule.PATTERN;
    }
    else if (formControl?.hasError(ValidationRule.REQUIRED)) {
      return ValidationRule.REQUIRED;
    }
    return undefined;
  }
}
